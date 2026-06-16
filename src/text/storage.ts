const DB_NAME = 'pingutype-docs'
const DB_VERSION = 1
const PAGE_STORE = 'pages'
const META_STORE = 'documents'

interface DocMeta {
  hash: string
  totalPages: number
  isScanned: boolean
  totalWords: number
  wordsPerPage: number[]
  createdAt: number
}

interface PageRecord {
  hash: string
  pageNumber: number
  text: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(PAGE_STORE)) {
        const pageStore = db.createObjectStore(PAGE_STORE, {
          keyPath: 'id',
        })
        pageStore.createIndex('hash_page', ['hash', 'pageNumber'], {
          unique: true,
        })
      }

      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'hash' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveDocMeta(meta: DocMeta): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).put(meta)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getDocMeta(
  hash: string,
): Promise<DocMeta | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly')
    const req = tx.objectStore(META_STORE).get(hash)
    req.onsuccess = () => resolve(req.result as DocMeta | undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function savePageText(
  hash: string,
  pageNumber: number,
  text: string,
): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PAGE_STORE, 'readwrite')
    tx.objectStore(PAGE_STORE).put({
      id: `${hash}_${pageNumber}`,
      hash,
      pageNumber,
      text,
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPageText(
  hash: string,
  pageNumber: number,
): Promise<string | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PAGE_STORE, 'readonly')
    const req = tx.objectStore(PAGE_STORE).get(`${hash}_${pageNumber}`)
    req.onsuccess = () => {
      const record = req.result as PageRecord | undefined
      resolve(record?.text)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getPageTextBatch(
  hash: string,
  pageNumbers: number[],
): Promise<Map<number, string>> {
  const db = await openDB()
  const result = new Map<number, string>()

  const promises = pageNumbers.map(
    (pn) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(PAGE_STORE, 'readonly')
        const req = tx.objectStore(PAGE_STORE).get(`${hash}_${pn}`)
        req.onsuccess = () => {
          const record = req.result as PageRecord | undefined
          if (record?.text != null) {
            result.set(pn, record.text)
          }
          resolve()
        }
        req.onerror = () => reject(req.error)
      }),
  )

  await Promise.all(promises)
  return result
}

export async function deleteDoc(hash: string): Promise<void> {
  const db = await openDB()

  const pagesToDelete: string[] = []

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PAGE_STORE, 'readonly')
    const index = tx.objectStore(PAGE_STORE).index('hash_page')
    const range = IDBKeyRange.bound([hash, 0], [hash, Infinity])
    const req = index.openCursor(range)

    req.onsuccess = () => {
      const cursor = req.result
      if (cursor) {
        pagesToDelete.push(cursor.value.id)
        cursor.continue()
      } else {
        resolve()
      }
    }
    req.onerror = () => reject(req.error)
  })

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PAGE_STORE, 'readwrite')
    for (const id of pagesToDelete) {
      tx.objectStore(PAGE_STORE).delete(id)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).delete(hash)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
