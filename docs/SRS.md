# Software Requirements Specification

## 1. Document information

**System:** The Days We Felt Alive — CD/DVD Rental Management System
**Course:** 66-131216 FRONT-END SOFTWARE DEVELOPMENT
**Author:** Htut Kaung San — b67103023
**Version:** 1.0, 9 October 2026

## 2. Purpose and objectives

Provide a small, database-connected rental application for a shop that lends music and movie CDs/DVDs. Customers discover available titles, rent one copy and see their rental history. Staff maintain the catalog and customer accounts and record physical returns. The project demonstrates Angular, responsive Bootstrap 5 styling, asynchronous CRUD, form validation and JWT authentication through a short catalog → rental → return presentation.

## 3. Scope and actors

| Actor | Responsibilities |
|---|---|
| Guest | Browse/search/filter the public catalog; register a customer account; sign in. |
| Customer | Browse the catalog; rent an available copy; view own rental history; sign out. |
| Admin | View shop summary; create/read/update/delete media and customers; view all rentals; record returns; sign out. |

Public registration cannot create an admin. Admin accounts are seeded by the backend. Online payment, reservations, delivery, notifications, image uploads and individual physical-disc tracking are outside scope. A rental contains one media title and one copy. Admin CRUD forms operate on customers, not admin accounts.

## 4. Functional requirements

| ID | Requirement | Acceptance condition |
|---|---|---|
| FR-01 | Display a public catalog with title search, music/movie category and CD/DVD format filters. | Filters retrieve matching API records; stock and THB fees are displayed. |
| FR-02 | Register customers and authenticate users with JWT. | Valid registration signs the customer in; duplicate email and invalid credentials produce readable errors. |
| FR-03 | Protect role-specific routes and API actions. | Guests cannot open protected pages; customers cannot use admin actions or read another customer's rentals. |
| FR-04 | Provide full media CRUD. | Admin can create, list, edit and delete media; affected lists refresh after success. |
| FR-05 | Provide full customer CRUD. | Admin can create, list, edit and delete customers, including activation status and optional password changes. |
| FR-06 | Rent an available copy for 1–30 whole days. | A successful request reserves stock immediately and creates exactly one rental. |
| FR-07 | Prevent overselling and duplicate rentals. | Concurrent last-copy requests cannot both succeed; retries with the same UUID key return the original rental. |
| FR-08 | Display customer history and admin rental records. | Show rental/due/return dates, active/overdue/returned status and estimated or final fees. |
| FR-09 | Record physical returns. | Admin confirmation sets the return date and final late fee; repeated return does not charge twice. |
| FR-10 | Preserve historical records. | Active rental prevents deletion. Media/customer with past rentals is archived/deactivated; unused records may be removed. |
| FR-11 | Validate all data-entry forms on client and server. | Touched/dirty invalid controls show inline messages and Bootstrap invalid styling; invalid submission is prevented and direct invalid API calls are rejected. |
| FR-12 | Report loading, empty, success and failure states. | Requests update visible state; in-progress submission cannot be repeated. |
| FR-13 | Restore authentication within the browser tab. | Session token is attached to API requests; refresh restores the user; sign-out or protected 401 clears authentication. |

## 5. Validation and business rules

- Names: required nonblank text, maximum 100 characters. Media title and artist/director: required nonblank text, maximum 150 characters.
- Email: required, maximum 150 characters, strict `name@domain.tld` pattern, unique in the database. The API normalizes case and trims surrounding whitespace.
- New passwords: at least 8 characters, at most 72 UTF-8 bytes, with uppercase, lowercase, a digit and a non-whitespace symbol. Existing passwords can still be used to log in. Customer edit permits an empty password to retain the existing hash.
- Category: `music` or `movie`; format: `CD` or `DVD`. Total copies: whole number 1–999, never below active rentals. Daily fees: 0–9999.99 THB, at most two decimal places.
- Rental duration: whole number 1–30. Backend generates dates using Asia/Bangkok. Rental fee = selected days × daily fee. Due-day returns incur no late fee; later returns incur calendar days late × the snapshotted daily late fee. Rates are stored per rental so later catalog edits do not change old charges.
- Availability = total copies minus active rentals. Transactions lock the media row before allocating a copy. A UUID v4 request key identifies retryable rental requests.
- API errors use standardized JSON and appropriate 400/401/403/404/409/500 status codes. Password hashes are excluded from responses.

## 6. Non-functional requirements

| ID | Requirement | Verification |
|---|---|---|
| NFR-01 | Responsive desktop, tablet and mobile layout using Angular + Bootstrap 5. | Inspect at desktop, 768px tablet and 390px phone widths; tables may scroll within their container. |
| NFR-02 | Secure authorization and password storage. | JWT interceptor/guards plus server role/ownership checks; bcrypt hashes; parameterized SQL; no real secrets in Git. Public deployment must use HTTPS and configured secrets. |
| NFR-03 | Consistent asynchronous state. | HttpClient methods return RxJS Observables; page actions await them through firstValueFrom and update signals, with loading/failure feedback. |
| NFR-04 | Reliable stock and persistent data. | MySQL row locks/transactions, unique request keys, idempotent returns and Docker named volume. |
| NFR-05 | Simple maintainable architecture. | Separate frontend/backend repositories; typed shared API/auth services; shared validators; backend config/controllers/middleware/models/routes separation. |
| NFR-06 | Accessible form feedback. | Semantic labels, keyboard controls, visible focus, inline messages, aria-invalid and aria-describedby. |
| NFR-07 | Reproducible local setup. | README clone/install/run steps, Docker health check and database initialization; production build and automated tests pass. |

No response-time or uptime service-level guarantee is claimed for this classroom application.

## 7. Architecture and data

Browser → Angular frontend → Nginx `/api/v1` proxy → Express API → MySQL. Angular development uses a local API proxy instead of Nginx. JWT authorization is enforced by the API. See [architecture diagram](architecture-diagram.png).

Three tables: `users` (identity, password hash, role, activation), `media` (catalog, copy count, fees, archive state and optional retro release metadata/local artwork URL), and `rentals` (user/media foreign keys, dates, rate snapshots, totals, request key). User 1:N rentals; media 1:N rentals. See the [ER diagram](er-diagram.png) and the backend repository for endpoint-by-endpoint documentation.

## 8. Use cases

See the [Use Case Diagram](use-case-diagram.png); its editable source is [SVG](use-case-diagram.svg). Lines denote actor participation. Media/customer CRUD includes create, read, update and delete.

| Use case | Preconditions | Main flow | Alternate/error flow |
|---|---|---|---|
| Register / sign in | Guest; valid registration details or existing active account. | Enter details → validation → API request → store JWT → role landing page. | Invalid fields show inline errors; duplicate email/credentials/server failure show an alert. |
| Browse catalog | None. | Load titles → search/filter → view copies and fees. | Empty result or request error is displayed. |
| Rent one copy | Active signed-in customer; stock available. | Choose title → enter days → review fee → confirm → rental created → stock/history refresh. | Invalid days block submission; no stock returns conflict; retry retains the request key. |
| View own history | Customer signed in. | Open My Rentals → list dates/status/fees. | API enforces ownership; expired session redirects to login. |
| Manage media | Admin signed in. | List → create/edit/delete → validate → confirm deletion → list refresh. | Active rental prevents deletion; historical media is archived. |
| Manage customers | Admin signed in. | List → create/edit/delete → validate → confirm deletion → list refresh. | Duplicate email rejected; active rental blocks deletion; historical customer is deactivated. |
| Receive return | Admin signed in; existing active rental. | Open rentals → select return → confirm → API computes fees → list refresh. | Repeated return preserves prior result; missing record or request failure shows an error. |

## 9. Assignment traceability

| Assignment requirement | Project evidence |
|---|---|
| 1. SRS and Use Case Diagram in /docs | This document; use-case-diagram.png and editable SVG. |
| 2. Angular with responsive Bootstrap 5/Tailwind | Bootstrap 5 stylesheet; responsive catalog grid and styled forms; custom mobile navigation/layout rules. |
| 3. Complete CRUD and RxJS Observables | Media/customer management pages → HttpClient services → Express → MySQL. |
| 4. Client/server form validation and feedback | Angular Reactive Forms, shared validators, inline field errors, Bootstrap is-invalid; API validation and tests. |
| 5. JWT authentication | Register/login, sessionStorage, interceptor, role guards, server authorization. |
| GitHub structure and README | Repository-root frontend/, docs/, README.md; student identity and local setup steps. |

## 10. Acceptance and demonstration

Run client validation tests and production build; run backend unit/integration tests. Demonstrate register → login → filter catalog → rent → own history → admin return, followed by media/customer CRUD. Check invalid/weak password feedback before submission, mobile/tablet/desktop layouts, unauthorized access, duplicate email, last-copy concurrency, retry keys, on-time/late/repeated returns and rate snapshots. Current results and limitations are recorded in [verification.md](verification.md).

## 11. Submission

Public frontend repository: https://github.com/htutkaungsan/the-days-we-felt-alive-frontend
Backend repository: https://github.com/htutkaungsan/the-days-we-felt-alive-backend

Submit the frontend repository URL through the course MS Teams channel by the instructor's deadline. The supplied assignment does not state a calendar deadline. MS Teams submission is the student's responsibility.

## Retro catalog enhancement — 9 October 2026

Sixteen Thai/English albums and films from 1990–2014 are included by the backend. Catalog cards show original titles, year, language, genre, cover/poster and song highlights. All artwork is stored in the backend public folder and delivered via the frontend’s `/images/` proxy. Existing media without metadata retain the fallback cover. The rental, return, CRUD and authentication rules remain the same.
