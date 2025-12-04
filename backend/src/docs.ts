import express from 'express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const router = express.Router();

// Load OpenAPI YAML once at startup (used for swagger-ui-express and the JSON endpoint)
const yamlPath = path.join(__dirname, '../docs/openapi.yaml');
function loadOpenApi(): any {
  const content = fs.readFileSync(yamlPath, 'utf8');
  return yaml.load(content) as any;
}

// Serve the OpenAPI JSON by converting YAML -> JSON
router.get('/openapi.json', (req, res) => {
  try {
    const doc = loadOpenApi();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to load OpenAPI spec' });
  }
});


// Serve only a single docs SPA at / (this file will expose `/docs/openapi.json` and
// the SPA UI). We intentionally do not expose multiple docs endpoints — only `/docs`.
const staticDir = path.join(__dirname, '../docs/static');
// Ensure index.html is served at the route root
router.use('/', express.static(staticDir));
// If a direct directory access is used, serve index.html explicitly
router.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Redirect other legacy docs routes to the single /docs entry to keep one URL
router.get('/ui', (req, res) => res.redirect('/docs'));
router.get('/landing.html', (req, res) => res.redirect('/docs'));

export default router;
