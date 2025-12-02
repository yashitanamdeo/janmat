import express from 'express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';

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

// Integrate swagger-ui-express at /ui for a server-side swagger UI
try {
  const spec: any = loadOpenApi();
  router.use('/ui', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
} catch (err) {
  // If spec cannot be loaded, still continue and serve static UI
  console.error('Failed to mount swagger-ui-express:', err);
}

// Serve static docs UI (kept for PDF generation and custom copy-curl script)
const staticDir = path.join(__dirname, '../docs/static');
router.use('/', express.static(staticDir));

export default router;
