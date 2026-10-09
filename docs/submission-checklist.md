# Submission readiness check

Checked: 9 October 2026 (Asia/Bangkok). Student: **Htut Kaung San — b67103023**.

## Course repositories

| Course | Submit this public repository |
|---|---|
| 66-131216 Front-end Software Development | https://github.com/htutkaungsan/the-days-we-felt-alive-frontend |
| 66-131217 Back-end Software Development | https://github.com/htutkaungsan/the-days-we-felt-alive-backend |

The frontend repository links the separate backend; both are needed to run the complete app. Two repositories preserve the different directory layouts required by the two assignments.

## Requirement check

| Assignment | Required evidence | Status |
|---|---|---|
| Frontend 1 | Formal SRS, use cases and diagram images in root /docs | Present |
| Frontend 2 | Angular + Bootstrap 5 and desktop/tablet/mobile layout | Present; browser checked |
| Frontend 3 | Database-connected CRUD with RxJS Observables | Media/customer CRUD; HttpClient Observables |
| Frontend 4 | Client/server Reactive Form validation, patterns, strength and visual errors | Present; validator/API tests and browser feedback checked |
| Frontend 5 | JWT register/login, token storage, interceptor, guards | Present; sessionStorage, API auth/role/ownership enforcement |
| Frontend GitHub | Public repository, /frontend, /docs, root README with identity/architecture/setup | Present |
| Backend 1 | Architecture diagram/explanation and network boundaries | Present |
| Backend 2 | ERD with attributes, PK/FK and cardinalities | Present; three tables, 1:N relationships |
| Backend 3 | Node.js + Express + MySQL/MongoDB | Express + mysql2/MySQL |
| Backend 4 | Versioned REST routes, nouns/verbs and response status codes | Present |
| Backend 5 | Full CRUD for two resources, validation/errors/password filtering | Media and customers; integration tests pass |
| Backend 6 | bcrypt, JWT, Bearer middleware, role checks | Present |
| Backend 7 | Every endpoint's method/path/auth/body/parameters/success/failure docs | Root README, 18 endpoints |
| Backend 8 | Dockerfile, API/database Compose, environment mapping, private network, persistent volume | Present; fresh GitHub clone starts with initialized database |
| Backend GitHub | Exact source layout, public visibility, incremental individual commits | Present |

## Current validation

- Backend unit tests: 3/3. Backend integration scenarios: 6/6. Frontend validator tests: 4/4.
- Angular build succeeds; the complete Bootstrap CSS causes a non-fatal 500 kB initial-budget warning. Current initial bundle is about 616 kB raw / 119 kB estimated transferred.
- Public GitHub repositories were freshly cloned, backend started on a separate isolated database, health/catalog/seeded admin verified. Frontend Docker image builds from its fresh clone. The existing local app remains at ports 4200/3017.
- Existing browser evidence covers registration, customer rental/history, admin return, form validation, session refresh/guards and desktop/tablet/mobile views. This audit does not claim a new full browser walkthrough.
- Remote hosting is not required by either supplied PDF's submission criteria. No production server, domain, payment or SSL deliverable is added.

## Student actions before submitting

1. Open both public repository URLs while signed out to confirm you can view README, source and docs.
2. Perform a short manual customer → rent → history → admin return demo. Also create/edit/delete a temporary media record and customer with no rental history.
3. For the frontend course, submit the frontend public repository URL through MS Teams. Include the linked backend URL if the submission allows notes.
4. For the backend course, submit the backend public repository URL in the instructor's assignment submission location. The backend PDF specifies a URL but does not name a platform.
5. Check the actual course assignment deadline in MS Teams/LMS and keep its submitted confirmation. Neither supplied PDF includes a calendar deadline.
6. Use the updated eight-slide final deck for presentation. The old deck is preserved as a previous version; README links the final deck.

Both PDFs specify **repository URL** submission. ZIP, video, screenshots as separate uploads, a hosted URL and a PPTX upload are not explicitly required in these PDFs. Follow any additional upload fields or later instructor announcements. The presentation is an additional deliverable requested for this project.
