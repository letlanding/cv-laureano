// Genera cv-laureano.pdf (A4 vertical, para imprimir) a partir de index.html.
// Uso: node scripts/make-pdf.mjs

import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = pathToFileURL(path.join(root, 'index.html')).href;
const output = path.join(root, 'cv-laureano.pdf');

const VIEWPORT_WIDTH = 1280;
// A4 mide 210 mm = 793,7 px a 96 ppp; 793,7 / 1280 ≈ 0,62 hace entrar
// el ancho de escritorio completo en la hoja.
const SCALE = 0.62;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: VIEWPORT_WIDTH, height: 900 } });

  // Diseño de pantalla. Movimiento reducido para que las animaciones de
  // aparición y los contadores queden en su estado final al imprimir.
  await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await page.goto(input, { waitUntil: 'load' });

  // Scroll hasta el final para disparar las imágenes con loading="lazy"
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });

  // Esperar tipografías e imágenes
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? null
          : new Promise((r) => {
              img.addEventListener('load', r, { once: true });
              img.addEventListener('error', r, { once: true });
            })
      )
    );
  });

  await page.evaluate(() => window.scrollTo(0, 0));

  const status = await page.evaluate(() => ({
    // Se ignora el <img> vacío del visor de fotos (no tiene src hasta abrirse)
    brokenImages: Array.from(document.images)
      .filter((img) => img.hasAttribute('src') && (!img.complete || img.naturalWidth === 0))
      .map((img) => img.getAttribute('src')),
    fraunces: document.fonts.check('500 20px Fraunces'),
    dmSans: document.fonts.check('400 16px "DM Sans"')
  }));
  if (status.brokenImages.length) console.warn('Imágenes sin cargar:', status.brokenImages);
  if (!status.fraunces || !status.dmSans) console.warn('Tipografías sin cargar:', status);

  await page.pdf({
    path: output,
    format: 'A4',
    scale: SCALE,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log(`PDF generado: ${output}`);
} finally {
  await browser.close();
}
