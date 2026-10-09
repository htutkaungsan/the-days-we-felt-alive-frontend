# The Days We Felt Alive — Angular Frontend

The separate Angular frontend for the CD/DVD rental management API. UI text is English. Styling uses plain CSS with no UI framework.

## Docker demo

Start the sibling backend first:

```sh
cd ../backend
docker compose up -d --build
cd ../frontend
docker compose up -d --build
```

Open http://localhost:4200. Default local admin: `admin@example.com` / `ChangeMe123!`. Register your own customer account to rent. Custom backend credentials come from its `.env` file.

Nginx serves Angular and forwards `/api/v1` to `express-api:3000` through the backend Docker network `alive-backend_rental`. Backend is independently hosted on localhost:3017. MySQL stays private. Frontend uses an unprivileged Nginx image.

## Development

Node.js 24.15+ is required by Angular 22. Use:

```sh
npm ci
npm start
```

The development proxy sends `/api` to localhost:3017. Run `npm run build` for a production build.

## Pages and responsibilities

- `/`: public catalog, title search, music/movie and CD/DVD filters. Logged-in customers confirm one-copy rentals for 1-30 days.
- `/login`, `/register`: authentication. Registration always creates customers.
- `/my-rentals`: protected customer history, due dates and estimated/final fees.
- `/admin`: protected shop overview.
- `/admin/media`: catalog CRUD, archive/unarchive, fees and copies.
- `/admin/customers`: customer CRUD and activation.
- `/admin/rentals`: all rentals, status filter and physical-return confirmation.

Services wrap HttpClient and hold authentication state. The interceptor adds Bearer tokens only to API requests and signs out on protected 401 responses. Route guards hide inappropriate pages, while the backend enforces permissions. JWTs live in sessionStorage for this small local project and expire after two hours. A new tab requires login. Do not serve this app without HTTPS on a public host.

Signals manage loading/errors/results. Forms prevent repeat submits, and rental retries reuse a UUID key while the confirmation dialog stays open. Fees use THB. All actions show success or error messages. Admin delete/return operations use in-app confirmation dialogs.

See backend README for complete API documentation, database schema, automated tests and architecture. The backend repository also includes diagrams, the eight-slide PPTX and demo instructions.

## Verification

Production build passes. Customer registration, filtering, rental confirmation, history and session restoration were verified in the browser, followed by admin return and CRUD management. Backend integration tests independently check permissions and concurrency. See backend `docs/verification.md` for evidence.

## Connected backend

[Backend API and presentation](https://github.com/htutkaungsan/the-days-we-felt-alive-backend). Clone the projects into sibling `backend` and `frontend` folders.

Version requirements: [Angular compatibility](https://angular.dev/reference/versions).
