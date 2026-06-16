import type { TextSource } from '@/types/text'

function sanitizeText(raw: string): string {
  return raw
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u00A0]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(\s*-\s*)/g, '-')
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function parsePdfBuffer(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist')

  const { default: workerUrl } = await import(
    'pdfjs-dist/build/pdf.worker.min.mjs?url'
  )
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

  const loadingTask = pdfjsLib.getDocument({ data: buffer })
  const doc = await loadingTask.promise

  const pageTexts: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const textContent = await page.getTextContent()

    const pageTokens: string[] = []
    let lastY: number | null = null

    for (const item of textContent.items) {
      if (!('str' in item) || !item.str) continue

      const transform = 'transform' in item ? (item as { transform: number[] }).transform : null
      const currentY = transform ? transform[5] : null

      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 2) {
        pageTokens.push('\n')
      }

      pageTokens.push(item.str)
      lastY = currentY
    }

    pageTexts.push(pageTokens.join(''))
  }

  return pageTexts.join('\n')
}

export const pdfSource: TextSource = {
  id: 'pdf',
  name: 'Upload PDF',
  description: 'Extract text from a PDF document for typing practice.',
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
          const rawText = await parsePdfBuffer(buffer)
          const cleanText = sanitizeText(rawText)

          if (!cleanText) {
            reject(new Error(
              'No readable text found in this PDF. The document may be scanned or image-based.',
            ))
            return
          }

          resolve(cleanText)
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
}
