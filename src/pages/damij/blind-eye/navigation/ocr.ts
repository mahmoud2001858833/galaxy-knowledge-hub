// Lazy Tesseract.js loader for the "اقرأ" voice command (Arabic + English).
// We dynamically import so the 2MB+ worker only loads when the user asks to read.

let workerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const Tesseract = await import('tesseract.js');
      const w = await Tesseract.createWorker(['ara', 'eng'], 1, {
        // Use CDN-hosted assets so we don't have to bundle them.
        workerPath: 'https://unpkg.com/tesseract.js@7.0.0/dist/worker.min.js',
        corePath: 'https://unpkg.com/tesseract.js-core@6.0.0',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      });
      return w;
    })();
  }
  return workerPromise;
}

export async function recognizeImage(dataUrl: string): Promise<string> {
  const worker = await getWorker();
  const { data } = await worker.recognize(dataUrl);
  return (data?.text || '').trim();
}

export async function terminateOCR() {
  if (!workerPromise) return;
  try {
    const w = await workerPromise;
    await w.terminate();
  } catch {}
  workerPromise = null;
}
