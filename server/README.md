# EcoSphere Server

## Setup
```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
psql your_database < ../ecosphere_schema.sql   # run the schema first
npm run dev
```

## Folder structure
```
config/       # db connection
middleware/   # auth (JWT verify + role check)
controllers/  # business logic per module
routes/       # route definitions, wire controllers to Express
server.js     # app entry point
```

## Adding your module (B and D)
1. Create `controllers/yourModuleController.js` — follow `departmentController.js` as a template.
2. Create `routes/yourModuleRoutes.js` — follow `departmentRoutes.js` as a template.
3. Import and mount it in `server.js` (uncomment / add your line).
4. Use `requireAuth` on every route, `requireRole('Admin', 'Manager')` where the API contract says so.
5. Match request/response shapes exactly from `ecosphere_api_contract.md` — the frontend is building against it already.

## Testing quickly
```bash
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```
