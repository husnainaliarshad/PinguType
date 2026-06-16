import Tesseract from 'tesseract.js'

let cachedWorker: Tesseract.Worker | null = null
let ocrQueue: Array<() => void> = []
let ocrRunning = false

async function getWorker(): Promise<Tesseract.Worker> {
  if (!cachedWorker) {
    cachedWorker = await Tesseract.createWorker('eng', 1)
    await cachedWorker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    })
  }
  return cachedWorker
}

function acquireOcrLock(): Promise<void> {
  return new Promise((resolve) => {
    if (!ocrRunning) {
      ocrRunning = true
      resolve()
    } else {
      ocrQueue.push(resolve)
    }
  })
}

function releaseOcrLock(): void {
  const next = ocrQueue.shift()
  if (next) {
    next()
  } else {
    ocrRunning = false
  }
}

async function renderPageToImage(
  page: { getViewport: (args: { scale: number }) => { width: number; height: number }; render: (args: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } },
): Promise<string> {
  const scale = 2
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2d context')

  await page.render({ canvasContext: ctx, viewport }).promise

  return canvas.toDataURL('image/png')
}

export async function ocrPage(
  page: { getViewport: (args: { scale: number }) => { width: number; height: number }; render: (args: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } },
  _pageNumber: number,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const imageDataUrl = await renderPageToImage(page)

  await acquireOcrLock()

  const worker = await getWorker()

  try {
    const ret = await worker.recognize(imageDataUrl)
    onProgress?.(100)
    return ret.data.text
  } finally {
    releaseOcrLock()
  }
}

export async function terminateOcrWorker(): Promise<void> {
  if (cachedWorker) {
    await cachedWorker.terminate()
    cachedWorker = null
    ocrRunning = false
    ocrQueue = []
  }
}

export async function isScannedPage(
  page: { getTextContent: () => Promise<{ items: Array<{ str?: string }> }> },
): Promise<boolean> {
  const textContent = await page.getTextContent()
  const totalText = textContent.items
    .filter((item) => 'str' in item)
    .map((item) => (item as { str: string }).str)
    .join('')
    .trim()
    .replace(/\s+/g, '')

  return totalText.length < 10
}

interface TextItem {
  str: string
  x: number
  y: number
}

function buildLineText(items: TextItem[]): string {
  const withPos = items.filter(
    (item) => Number.isFinite(item.x) && Number.isFinite(item.y),
  )
  if (withPos.length === 0) return items.map((it) => it.str).join('')

  const ys = withPos.map((item) => item.y).sort((a, b) => a - b)

  const diffs: number[] = []
  for (let i = 1; i < ys.length; i++) {
    diffs.push(ys[i] - ys[i - 1])
  }

  if (diffs.length === 0) return items.map((it) => it.str).join('')

  diffs.sort((a, b) => a - b)
  const medianGap = diffs[Math.floor(diffs.length / 2)]
  const lineThreshold = Math.max(1, medianGap * 0.4)

  const lines: TextItem[][] = []
  const sorted = [...items].sort((a, b) => a.y - b.y)

  for (const item of sorted) {
    if (lines.length === 0) {
      lines.push([item])
      continue
    }

    const lastLine = lines[lines.length - 1]
    const lastLineAvgY =
      lastLine.reduce((sum, it) => sum + it.y, 0) / lastLine.length

    if (Math.abs(item.y - lastLineAvgY) <= lineThreshold) {
      lastLine.push(item)
    } else {
      lines.push([item])
    }
  }

  return lines
    .filter((line) => line.length > 0)
    .map((line) =>
      line
        .sort((a, b) => a.x - b.x)
        .map((it) => it.str)
        .join(''),
    )
    .join('\n')
}

export async function extractPageText(
  page: { getTextContent: () => Promise<{ items: Array<{ str?: string; transform?: number[] }> }> },
): Promise<string> {
  const textContent = await page.getTextContent()

  const rawItems: TextItem[] = []

  for (const item of textContent.items) {
    if (!('str' in item) || !item.str) continue

    const transform = 'transform' in item
      ? (item as { transform: number[] }).transform
      : null

    rawItems.push({
      str: item.str,
      x: transform ? transform[4] : NaN,
      y: transform ? transform[5] : NaN,
    })
  }

  return buildLineText(rawItems)
}
