/**
 * Build do PDF "Regulatório BCB · Fundamentos".
 *
 * 1. Lê os 6 markdowns (cada parte)
 * 2. Renderiza cada um com `marked` para HTML
 * 3. Constrói cover + TOC automaticamente
 * 4. Encapsula no template HTML com style.css
 * 5. Abre via puppeteer-core e exporta PDF (A4) com headers/footers + page numbers
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer-core');

const ROOT = __dirname;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const PARTS = [
  { file: '01-parte-1-fundamentos.md', label: 'Parte I — Fundamentos do SFN' },
  { file: '02-parte-2-pix.md', label: 'Parte II — Pix' },
  { file: '03-parte-3-dict.md', label: 'Parte III — DICT' },
  { file: '04-parte-4-open-finance.md', label: 'Parte IV — Open Finance Brasil' },
  { file: '05-parte-5-opin-compliance.md', label: 'Parte V — Open Insurance + Compliance' },
];

// ----- Marked configuration -----
marked.setOptions({
  gfm: true,
  breaks: false,
});

// ----- Build cover HTML -----
function buildCover() {
  return `
<section class="cover">
  <div class="cover-header">Guia de Fundamentos · Open Source · MIT</div>
  <div class="cover-main">
    <h1 class="cover-title">Regulatório<br/>Financeiro<br/>Brasileiro</h1>
    <p class="cover-subtitle">
      Fundamentos completos do sistema financeiro nacional, Pix, DICT,
      Open Finance, Open Insurance, compliance e padrões de
      implementação — escrito do zero, sem assumir conhecimento prévio.
    </p>
    <div class="cover-tags">
      <span class="cover-tag">Pix</span>
      <span class="cover-tag">DICT</span>
      <span class="cover-tag">Open Finance</span>
      <span class="cover-tag">OPIN</span>
      <span class="cover-tag">FAPI 2.0</span>
      <span class="cover-tag">mTLS · ICP-Brasil</span>
      <span class="cover-tag">Compliance</span>
    </div>
  </div>
  <div class="cover-footer">
    <p class="cover-footer-author">Paulo Marcos Lucio</p>
    <p class="cover-footer-meta">
      Engenheiro Java pleno · Consultor em integrações regulatórias BR<br/>
      <a href="https://github.com/Paulo-Marcos-Lucio">github.com/Paulo-Marcos-Lucio</a>
    </p>
  </div>
</section>
`;
}

// ----- Extract chapter list from markdown for TOC -----
function extractChapters(md) {
  const chapters = [];
  const lines = md.split('\n');
  for (const line of lines) {
    const m = line.match(/^##\s+Capítulo\s+(\d+)\s*[—–-]\s*(.+)$/);
    if (m) {
      chapters.push({ num: m[1], title: m[2].trim() });
    }
  }
  return chapters;
}

// ----- Build TOC HTML -----
function buildTOC(parts) {
  let html = `
<section class="toc">
  <h1>Sumário</h1>
  <p class="toc-intro">
    Você pode ler de ponta a ponta (recomendado pra primeira vez) ou usar como
    referência — cada capítulo é autocontido. As Partes I a IV constroem a base
    teórica; a V cobre compliance e operação; a VI é o cheat sheet pra call.
  </p>
  <ol>
`;
  for (const part of parts) {
    html += `    <li class="toc-part">${part.label}</li>\n`;
    for (const ch of part.chapters) {
      html += `    <li class="toc-chapter"><span class="toc-chapter-num">Cap. ${ch.num}</span><span class="toc-chapter-title">${ch.title}</span></li>\n`;
    }
  }
  html += `  </ol>
</section>
`;
  return html;
}

// ----- Render each markdown to HTML with chapter extraction -----
function renderPart(filename) {
  const md = fs.readFileSync(path.join(ROOT, filename), 'utf-8');
  const html = marked.parse(md);
  const chapters = extractChapters(md);
  return { html, chapters };
}

// ----- Compose full HTML document -----
function composeHtml() {
  const cover = buildCover();
  const partsRendered = PARTS.map(p => ({
    label: p.label,
    ...renderPart(p.file),
  }));
  const toc = buildTOC(partsRendered);

  const body = partsRendered.map(p => `<section class="part">\n${p.html}\n</section>`).join('\n\n');

  const cssPath = path.join(ROOT, 'style.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Regulatório BCB · Fundamentos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>
${cover}
${toc}
${body}
</body>
</html>`;
}

// ----- Main -----
(async () => {
  console.log('[1/4] Compose HTML...');
  const html = composeHtml();
  const htmlPath = path.join(ROOT, 'build', 'book.html');
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`     wrote ${htmlPath} (${(html.length / 1024).toFixed(1)} KB)`);

  console.log('[2/4] Launch Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('[3/4] Open & wait for fonts...');
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath.replace(/\\/g, '/'), {
    waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
  });
  // give web fonts a beat
  await new Promise(r => setTimeout(r, 1500));

  console.log('[4/4] Generate PDF...');
  const pdfPath = path.join(ROOT, 'regulatorio-bcb-fundamentos-public.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: { top: '22mm', right: '18mm', bottom: '22mm', left: '18mm' },
  });

  await browser.close();

  const stats = fs.statSync(pdfPath);
  console.log(`\nDone: ${pdfPath}`);
  console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
})().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
