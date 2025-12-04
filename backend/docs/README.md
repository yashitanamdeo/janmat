JanMat API Documentation
=========================

This folder contains the OpenAPI specification and a static documentation UI.

Files:
- `openapi.yaml` — human-readable OpenAPI 3.0 specification with examples and schemas.
- `openapi.json` — generated JSON (run `npm run docs:json`).
- `static/landing.html` — friendly user guide landing page intended for non-technical users.
- `static/index.html` — interactive Swagger UI with "Copy cURL" enhancements.
- `janmat-api-docs.pdf` — generated PDF (if created by `npm run docs:pdf`).

Quick usage
-----------
1. Install dependencies in `backend`:

```powershell
cd backend
npm install
```

2. Start the server and open docs locally:

```powershell
npm run dev
# open http://localhost:3000/docs/landing.html or http://localhost:3000/docs/ui
```

3. Generate OpenAPI JSON and PDF:

```powershell
npm run docs:json
npm run docs:pdf
```

Glossary (non-technical)
------------------------
- JWT / Token: a secure code the server gives you after login — paste it into the Authorization header (`Bearer <TOKEN>`) to use protected endpoints.
- Complaint: an issue reported by a citizen (e.g., pothole). Contains `title`, `description`, `urgency`, `status`.
- Department: a team responsible for complaints (e.g., Roads Department).
- Feedback: a rating/comment you give after a complaint is resolved.

If you want more friendly examples for a particular endpoint (e.g. CSV report download or file upload examples), tell me which endpoint and I will add specific step-by-step examples and screenshots.
