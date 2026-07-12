# EcoSphere API Contract

Shared reference so all backend members can build in parallel without blocking each other.
All routes prefixed with `/api`. All protected routes require `Authorization: Bearer <token>`.

---

## Auth — Member A

### POST /api/auth/signup
Request:
```json
{ "name": "Priya Shah", "email": "priya@company.com", "password": "Secret123", "department_id": 1 }
```
Response 201:
```json
{ "id": 5, "name": "Priya Shah", "email": "priya@company.com", "role": "Employee", "token": "<jwt>" }
```
Validation: email format, password min 6 chars, name required, email uniqueness.

### POST /api/auth/login
Request:
```json
{ "email": "priya@company.com", "password": "Secret123" }
```
Response 200: same shape as signup response.
Errors: 401 invalid credentials.

### GET /api/auth/me
Header: Bearer token. Returns current logged-in employee's profile (id, name, email, role, department_id, xp_points).

---

## Departments & Employees — Member A

### GET /api/departments
Returns list of all departments with head name and status.

### POST /api/departments  *(Admin only)*
```json
{ "name": "Finance", "code": "FIN" }
```

### GET /api/employees
Query params: `?department_id=1&status=Active`
Returns list of employees (id, name, email, department, role, status, xp_points).

### PATCH /api/employees/:id/role  *(Admin only)*
```json
{ "role": "Manager" }
```

---

## Environmental — Member B

### GET /api/emission-factors
Returns all emission factors (id, activity_name, unit, co2_per_unit).

### POST /api/emission-factors  *(Admin/Manager)*
```json
{ "activity_name": "Natural Gas", "unit": "m3", "co2_per_unit": 1.9 }
```

### POST /api/carbon-transactions
```json
{ "department_id": 1, "emission_factor_id": 2, "quantity": 150, "transaction_date": "2026-07-10" }
```
Server calculates `co2_emitted = quantity * co2_per_unit` — do NOT trust a client-sent value.
Validation: quantity > 0, valid department_id and emission_factor_id, date not in the future.

### GET /api/carbon-transactions
Query params: `?department_id=1&from=2026-07-01&to=2026-07-12`
Returns transactions, useful for the Environmental dashboard chart.

### GET /api/dashboard/emissions-summary
Returns total CO2 by department — powers the dashboard bar chart.
```json
[{ "department": "Operations", "total_co2": 402.5 }, { "department": "Engineering", "total_co2": 88.1 }]
```

---

## Social / CSR — Member B

### GET /api/csr-activities
Returns list of activities (id, title, category, activity_date, points_value).

### POST /api/csr-activities  *(Admin/Manager)*
```json
{ "title": "Beach Cleanup", "category": "Environment", "description": "...", "activity_date": "2026-07-20", "points_value": 20 }
```

### POST /api/csr-activities/:id/join
Employee joins an activity. Creates an `employee_participation` row with status `Pending`.
```json
{ "proof_url": "https://..." }
```
Validation: block duplicate join (unique constraint will catch it — return a friendly 409 message).

### PATCH /api/participation/:id/approve  *(Admin/Manager)*
Sets `approval_status = Approved`, `points_earned = activity.points_value`, `completion_date = today`,
and **adds points_earned to the employee's `xp_points`** — trigger badge check here (see Gamification).

### PATCH /api/participation/:id/reject  *(Admin/Manager)*
Sets `approval_status = Rejected`, `points_earned = 0`.

### GET /api/participation?employee_id=5
Returns an employee's participation history — used on their profile page.

---

## Gamification — Member D

### GET /api/badges
Returns all badges (id, name, description, unlock_xp_threshold, icon_url).

### GET /api/employees/:id/badges
Returns badges an employee has unlocked.

### Internal helper: `checkAndAwardBadges(employeeId)`
Not an exposed route — called internally right after XP changes (e.g. from the CSR approve endpoint above).
Logic: fetch employee's current `xp_points`, fetch all badges where `unlock_xp_threshold <= xp_points`
AND not already in `employee_badges` for this employee → insert new rows. Keep this as a shared utility
function so Member B's approve-endpoint can call it too.

### GET /api/leaderboard
Returns top employees sorted by `xp_points` descending.
```json
[{ "id": 5, "name": "Priya Shah", "xp_points": 340, "badge_count": 2 }, ...]
```

---

## Governance — Member D

### GET /api/compliance-issues
Query params: `?status=Open`
Returns issues; server should compute an `is_overdue` boolean (true if `status = Open` and `due_date < today`).

### POST /api/compliance-issues  *(Admin/Manager)*
```json
{ "title": "Missing safety cert", "description": "...", "owner_id": 3, "due_date": "2026-07-15" }
```
Validation: owner_id must exist, due_date required.

### PATCH /api/compliance-issues/:id/close
Sets `status = Closed`.

---

## Dashboard (combined) — whoever finishes first wires this up

### GET /api/dashboard/summary
One endpoint the frontend hits for the homepage — aggregates:
```json
{
  "total_co2": 490.6,
  "total_participants": 12,
  "open_compliance_issues": 3,
  "top_leaderboard": [{ "name": "Priya Shah", "xp_points": 340 }]
}
```
Keep this as a thin wrapper that calls the other queries — don't duplicate logic.

---

## Conventions everyone should follow

- All error responses: `{ "error": "human readable message" }` with correct HTTP status (400 validation, 401 auth, 403 forbidden, 404 not found, 409 conflict).
- All list endpoints return arrays directly (not wrapped in `{ data: [...] }`) — keep it simple.
- Dates as `YYYY-MM-DD` strings.
- Validate on the server even if the frontend also validates — judges specifically call this out.
- Never trust client-calculated values (CO2, points) — always compute server-side.
