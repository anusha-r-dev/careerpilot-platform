# CareerPilot

CareerPilot is a full-stack, multi-user job application organizer. It helps job seekers discover opportunities on trusted job websites, save original job links, and privately track every application from **Saved** to **Offer**.

The project demonstrates a production-style React and Ruby on Rails architecture with role-based access, PostgreSQL persistence, secure cookie sessions, responsive interfaces, and automated tests.

## Product overview

### Member workspace

- Create a personal account and sign in securely.
- Link personal profile and applications-page shortcuts for LinkedIn, Indeed, Naukri, Wellfound, Glassdoor, Remote OK, We Work Remotely, Remotive, Remote.co, Working Nomads, Himalayas, and FlexJobs.
- Open each official portal in a separate tab and authenticate directly with that provider.
- See real CareerPilot application counts for every job source without scraping portal data.
- Save a job's original URL, company, role, location, notes, and next-action date.
- Move applications through Saved, Applied, Interview, Offer, Rejected, and Withdrawn stages.
- Review private pipeline totals and upcoming interviews.
- Access only the applications that belong to the signed-in member.
- Optionally connect Gmail through OAuth without sharing an email password.
- Review, correct, confirm, or ignore detected applications before they change the pipeline.

### Administrator workspace

- Use a separate admin sign-in and protected admin routes.
- Review privacy-safe platform totals without exposing members' application details.
- Activate or deactivate member accounts.
- Manage the job-source shortcuts displayed to members.

## Privacy and data-source approach

CareerPilot does not scrape job websites or claim to provide their listings. The Job Portal Hub stores only member-supplied profile/application URLs and opens official third-party pages in a separate tab. Members authenticate on the provider's website, so CareerPilot never receives or stores LinkedIn, Naukri, Indeed, or other job-site passwords. Per-portal counts come from the member's private CareerPilot application records rather than third-party sessions.

Application and portal-profile records are scoped to the authenticated user. Administrators receive aggregate counts and account-management data, not members' private application records or portal shortcuts.

Gmail synchronization uses the read-only Gmail scope. OAuth access and refresh tokens are encrypted before database storage. Message bodies are processed temporarily by the parser and are not persisted; CareerPilot stores only the recruiting metadata required for the member's review queue.

All seeded people, applications, interview links, and credentials are synthetic demonstration data.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, CSS |
| Backend | Ruby 3.3.8, Rails 8.1 API |
| Database | PostgreSQL 17 |
| Authentication | BCrypt passwords, encrypted HTTP-only cookie, database-backed sessions |
| Portal hub | Private HTTPS shortcuts, source-level pipeline analytics, no third-party passwords |
| Mail integration | Google OAuth 2.0, Gmail REST API, encrypted tokens, review-first parser |
| Quality | Minitest, RuboCop, Brakeman, ESLint, TypeScript compiler, GitHub Actions |
| Local infrastructure | Docker Compose |
| Production deployment | Docker, Render Blueprint, managed PostgreSQL |

## Architecture

```text
Browser
  └── React + TypeScript client (localhost:5173)
        └── /api proxy
              └── Rails JSON API (localhost:3000)
                    └── Active Record
                          └── PostgreSQL (localhost:5433)
```

The frontend renders the interface with reusable React components and calls the Rails API. Rails performs authentication, authorization, validation, and user-level data scoping before reading from or writing to PostgreSQL.

## Local setup

### Prerequisites

- Node.js 22.23.1 (the repository includes `.nvmrc`)
- Ruby 3.3.8
- Bundler
- Docker Desktop with Docker Compose

### 1. Start PostgreSQL

```bash
docker compose up -d db
```

### 2. Prepare and run the Rails API

```bash
cd backend
bundle install
bin/rails db:prepare
bin/rails db:seed
bin/rails server
```

The API is available at `http://127.0.0.1:3000`. Its health endpoint is `http://127.0.0.1:3000/api/v1/health`.

### 3. Prepare and run the React application

Open another terminal from the repository root:

```bash
cd frontend
nvm use
npm install
npm run dev
```

The website is available at `http://127.0.0.1:5173`.

## Production deployment

CareerPilot ships as one production container: Vite builds the React client,
Rails serves the compiled files and JSON API from the same HTTPS origin, and
Render PostgreSQL stores application data. This keeps cookie authentication
first-party and provides one public website URL.

The root `render.yaml` Blueprint declares the web service and PostgreSQL
database. After this repository is available on GitHub:

1. Open Render and create a new Blueprint from this repository.
2. When prompted for `RAILS_MASTER_KEY`, copy the value from
   `backend/config/master.key` on your computer. Never commit that file.
3. Approve the Blueprint. The first container start prepares the database and
   loads synthetic demonstration data only when the database has no users.
4. Open the assigned `onrender.com` URL and verify member and administrator
   sign-in.

Render automatically deploys the `main` branch after the GitHub Actions checks
pass. The production health check is `/api/v1/health`.

## Enable a real Gmail connection

The repository never contains live OAuth credentials. The seeded member account therefore starts with a clearly labelled synthetic email preview stored in PostgreSQL.

1. Create a Google Cloud project and enable the Gmail API.
2. Configure an OAuth consent screen and add your Gmail account as a test user.
3. Create an OAuth web client with this authorized redirect URI:

   ```text
   http://127.0.0.1:3000/api/v1/integrations/gmail/callback
   ```

4. Store the client values in encrypted Rails credentials:

   ```bash
   cd backend
   EDITOR="code --wait" bin/rails credentials:edit
   ```

   ```yaml
   google:
     client_id: your-client-id.apps.googleusercontent.com
     client_secret: your-client-secret
   ```

5. Restart Rails. Connect Gmail from the member workspace and approve the read-only permission.

For a public production deployment, follow Google's OAuth verification and restricted-scope requirements. CareerPilot requests no permission to send, modify, or delete email.

## Demo access

| Portal | Email | Password |
| --- | --- | --- |
| Member | `anusha@careerpilot.demo` | `CareerPilotDemo123!` |
| Administrator | `admin@careerpilot.demo` | `CareerPilotDemo123!` |

New users can also register through the member registration page. Public registration always creates a member account; it cannot create an administrator.

## API summary

- `GET /api/v1/health`
- `GET`, `POST`, `DELETE /api/v1/session`
- `POST /api/v1/registration`
- `GET /api/v1/dashboard`
- `GET`, `POST`, `PATCH`, `DELETE /api/v1/applications`
- `POST /api/v1/interviews`
- `GET /api/v1/sources`
- `GET`, `POST`, `PATCH`, `DELETE /api/v1/portal_profiles`
- `PATCH /api/v1/portal_profiles/:id/opened`
- `GET /api/v1/integrations`
- `POST /api/v1/integrations/gmail/start`
- `GET /api/v1/integrations/gmail/callback`
- `POST /api/v1/integrations/:id/sync`
- `DELETE /api/v1/integrations/:id`
- `GET /api/v1/email_imports`
- `POST /api/v1/email_imports/:id/confirm`
- `PATCH /api/v1/email_imports/:id/ignore`
- `GET /api/v1/admin/dashboard`
- `GET`, `PATCH /api/v1/admin/users`
- `GET`, `POST`, `PATCH /api/v1/admin/sources`

Member and administrator endpoints enforce both authentication and role authorization on the server.

## Verification

Run backend tests:

```bash
cd backend
bin/rails test
```

Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

The test suite covers authentication, member/admin authorization, private application and portal ownership, secure portal URL validation, source-level counts, encrypted mailbox tokens, email parsing, and review-to-pipeline imports.

Current verified result: **30 backend tests and 132 assertions with zero failures**, **69 Ruby files with no style offenses**, **zero Brakeman security warnings**, plus successful ESLint and production TypeScript/Vite builds.

## Future enhancements

- Password reset and email verification
- Drag-and-drop pipeline updates
- Interview reminders and calendar export
- Resume-version tracking per application
- Official job-board API integrations where permitted
- Custom domain and transactional email delivery

## Disclaimer

CareerPilot is a portfolio and learning project. It is not affiliated with or endorsed by the job websites linked from the application.
