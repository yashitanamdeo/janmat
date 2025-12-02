#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const express = require('express');

async function writeJson() {
  const yamlPath = path.join(__dirname, '../docs/openapi.yaml');
  const content = fs.readFileSync(yamlPath, 'utf8');
  const doc = yaml.load(content);
  const out = path.join(__dirname, '../docs/openapi.json');
  fs.writeFileSync(out, JSON.stringify(doc, null, 2), 'utf8');
  console.log('Wrote', out);
}

async function generatePdf() {
  // Ensure JSON is present
  await writeJson();

  const puppeteer = require('puppeteer');
  const app = express();
  const staticDir = path.join(__dirname, '../docs/static');
  const jsonPath = path.join(__dirname, '../docs/openapi.json');
  // Serve static UI
  app.use('/docs', express.static(staticDir));
  // Serve the generated OpenAPI JSON at the expected path so Swagger UI can load it
  app.get('/docs/openapi.json', (req, res) => {
    res.sendFile(jsonPath);
  });
  const server = app.listen(0);
  const port = server.address().port;
  const url = `http://localhost:${port}/docs/`;

  console.log('Serving docs at', url);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    // Give swagger UI time to render
    await page.waitForTimeout(2000);
    const out = path.join(__dirname, '../docs/janmat-api-docs.pdf');
    await page.pdf({ path: out, format: 'A4', printBackground: true });
    console.log('PDF written to', out);
  } finally {
    await browser.close();
    server.close();
  }
}

async function main() {
  const arg = process.argv[2] || '--json';
  if (arg === '--json') {
    await writeJson();
    process.exit(0);
  }
  if (arg === '--pdf') {
    await generatePdf();
    process.exit(0);
  }
  console.log('Usage: generate-docs.js --json | --pdf');
}

main().catch(err => { console.error(err); process.exit(1); });
