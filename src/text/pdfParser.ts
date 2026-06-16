import type { PaginatedTextSource, PageInfo } from '@/types/text'
import { hashBuffer } from '@/utils/hash'
import { isScannedPage, extractPageText, ocrPage } from './ocr'
import {
  saveDocMeta,
  getDocMeta,
  savePageText,
  getPageText,
} from './storage'

const SMART_QUOTE_RE = /[\u2018\u2019\u201A\u201B\u2032\u2035]/g
const SMART_DOUBLE_QUOTE_RE = /[\u201C\u201D\u201E\u201F\u2033\u2036]/g
const DASH_RE = /[\u2013\u2014]/g
const NBSP_RE = /\u00A0/g
const SPACE_RE = /[^\S\n]+/g
const NEWLINE_COLLAPSE_RE = /\n{3,}/g

const PARALLEL_BATCH = 4
const OCR_BATCH = 1
const CHARS_PER_CHUNK = 2000
const PREFETCH_RADIUS = 2

function sanitizeText(raw: string): string {
  return raw
    .replace(SMART_DOUBLE_QUOTE_RE, '"')
    .replace(SMART_QUOTE_RE, "'")
    .replace(DASH_RE, '-')
    .replace(NBSP_RE, ' ')
    .replace(SPACE_RE, ' ')
    .replace(NEWLINE_COLLAPSE_RE, '\n\n')
    .trim()
}

// eslint-disable-next-line
type PDFLib = any
// eslint-disable-next-line
type PDFDoc = any

interface PdfSession {
  hash: string
  totalPages: number
  isScanned: boolean
  charsPerPage: number[]
  totalChars: number
  currentChunk: number
  chunkCount: number
  doc: PDFDoc
}

let activeSession: PdfSession | null = null
let prefetchPromise: Promise<void> | null = null

let cachedLib: PDFLib | null = null

async function getLib(): Promise<PDFLib> {
  if (cachedLib) return cachedLib
  const [pdfjsLib, workerModule] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default
  cachedLib = pdfjsLib
  return pdfjsLib
}

async function resolvePageText(
  hash: string,
  doc: PDFDoc,
  pageNumber: number,
  isScanned: boolean,
): Promise<string> {
  const cached = await getPageText(hash, pageNumber)
  if (cached != null) return cached

  const page = await doc.getPage(pageNumber)

  // eslint-disable-next-line
  const text = isScanned
    ? await ocrPage(page as any, pageNumber)
    : await extractPageText(page as any)

  const sanitized = sanitizeText(text)
  await savePageText(hash, pageNumber, sanitized)
  return sanitized
}

async function buildOrLoadSession(buffer: ArrayBuffer): Promise<PdfSession> {
  const lib = await getLib()
  const hash = await hashBuffer(buffer)

  const loadingTask = lib.getDocument({ data: buffer })
  const doc = await loadingTask.promise

  const existing = await getDocMeta(hash)
  if (existing) {
    return {
      hash,
      totalPages: existing.totalPages,
      isScanned: existing.isScanned,
      charsPerPage: existing.wordsPerPage,
      totalChars: existing.totalWords,
      currentChunk: 0,
      chunkCount: Math.max(1, Math.ceil(existing.totalWords / CHARS_PER_CHUNK)),
      doc,
    }
  }

  const totalPages = doc.numPages

  const page1 = await doc.getPage(1)
  // eslint-disable-next-line
  const scanned = await isScannedPage(page1 as any)

  const charsPerPage = new Array<number>(totalPages)

  const batchSize = scanned ? OCR_BATCH : PARALLEL_BATCH

  for (let i = 0; i < totalPages; i += batchSize) {
    const batch = Array.from(
      { length: Math.min(batchSize, totalPages - i) },
      (_, j) => resolvePageText(hash, doc, i + j + 1, scanned),
    )
    const results = await Promise.all(batch)
    for (let j = 0; j < results.length; j++) {
      charsPerPage[i + j] = Math.max(1, results[j].length)
    }
  }

  const totalChars = charsPerPage.reduce((sum, c) => sum + c, 0)

  await saveDocMeta({
    hash,
    totalPages,
    isScanned: scanned,
    totalWords: totalChars,
    wordsPerPage: charsPerPage,
    createdAt: Date.now(),
  })

  return {
    hash,
    totalPages,
    isScanned: scanned,
    charsPerPage,
    totalChars,
    currentChunk: 0,
    chunkCount: Math.max(1, Math.ceil(totalChars / CHARS_PER_CHUNK)),
    doc,
  }
}

function chunkToPageRange(
  session: PdfSession,
  chunkIndex: number,
): { startPage: number; endPage: number } {
  const charStart = chunkIndex * CHARS_PER_CHUNK
  const charEnd = charStart + CHARS_PER_CHUNK

  let cursor = 0
  let start = 1
  let end = session.totalPages

  for (let p = 0; p < session.charsPerPage.length; p++) {
    const pageChars = session.charsPerPage[p]
    if (cursor <= charStart && cursor + pageChars > charStart) {
      start = p + 1
    }
    if (cursor <= charEnd && cursor + pageChars >= charEnd) {
      end = p + 1
      break
    }
    cursor += pageChars
  }

  return { startPage: start, endPage: end }
}

async function getChunkText(
  session: PdfSession,
  chunkIndex: number,
): Promise<string> {
  const { startPage, endPage } = chunkToPageRange(session, chunkIndex)

  const pageTexts = new Array<string>(endPage - startPage + 1)

  for (let p = startPage; p <= endPage; p++) {
    const text = await resolvePageText(
      session.hash,
      session.doc,
      p,
      session.isScanned,
    )
    pageTexts[p - startPage] = text
  }

  const fullText = pageTexts.join('\n')

  const charStart = chunkIndex * CHARS_PER_CHUNK

  let charsBeforeStart = 0
  for (let p = 0; p < startPage - 1; p++) {
    charsBeforeStart += session.charsPerPage[p]
  }

  const localStart = charStart - charsBeforeStart
  const localEnd = localStart + CHARS_PER_CHUNK

  const chunk = fullText.slice(
    Math.max(0, localStart),
    Math.min(fullText.length, localEnd),
  )

  prefetchAdjacent(session, chunkIndex)

  return chunk
}

function prefetchAdjacent(
  session: PdfSession,
  chunkIndex: number,
): void {
  if (prefetchPromise) return

  prefetchPromise = (async () => {
    for (let offset = -PREFETCH_RADIUS; offset <= PREFETCH_RADIUS; offset++) {
      if (offset === 0) continue
      const neighbor = chunkIndex + offset
      if (neighbor < 0 || neighbor >= session.chunkCount) continue

      const range = chunkToPageRange(session, neighbor)
      for (let p = range.startPage; p <= range.endPage; p++) {
        await resolvePageText(
          session.hash,
          session.doc,
          p,
          session.isScanned,
        )
      }
    }
    prefetchPromise = null
  })()
}

export const pdfSource: PaginatedTextSource = {
  id: 'pdf',
  name: 'Upload PDF',
  description:
    'Extract text from PDFs — auto-detects scans and uses OCR. Chunked with persistent storage.',
  async getText(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf,application/pdf'

      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) {
          reject(new Error('No file selected'))
          return
        }

        try {
          const buffer = await file.arrayBuffer()
          activeSession = await buildOrLoadSession(buffer)
          const text = await getChunkText(activeSession, 0)
          resolve(text)
        } catch (err) {
          reject(
            new Error(
              `Failed to parse PDF: ${err instanceof Error ? err.message : 'Unknown error'}`,
            ),
          )
        }
      }

      input.oncancel = () => reject(new Error('File selection cancelled'))
      input.click()
    })
  },

  getPageInfo(): PageInfo | null {
    if (!activeSession) return null
    return {
      current: activeSession.currentChunk + 1,
      total: activeSession.chunkCount,
      chunkSize: CHARS_PER_CHUNK,
    }
  },

  async nextChunk(): Promise<string> {
    if (!activeSession) throw new Error('No active PDF session')
    if (activeSession.currentChunk >= activeSession.chunkCount - 1) {
      throw new Error('Already at the last chunk')
    }
    activeSession.currentChunk++
    return getChunkText(activeSession, activeSession.currentChunk)
  },

  async prevChunk(): Promise<string> {
    if (!activeSession) throw new Error('No active PDF session')
    if (activeSession.currentChunk <= 0) {
      throw new Error('Already at the first chunk')
    }
    activeSession.currentChunk--
    return getChunkText(activeSession, activeSession.currentChunk)
  },

  async goToChunk(n: number): Promise<string> {
    if (!activeSession) throw new Error('No active PDF session')
    const idx = n - 1
    if (idx < 0 || idx >= activeSession.chunkCount) {
      throw new Error(`Chunk ${n} out of range (1-${activeSession.chunkCount})`)
    }
    activeSession.currentChunk = idx
    return getChunkText(activeSession, idx)
  },

  reset(): void {
    activeSession = null
  },
}
