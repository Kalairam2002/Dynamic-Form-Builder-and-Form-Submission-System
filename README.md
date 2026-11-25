# Form Builder

A full stack app for building forms and collecting responses.

An admin creates a form in the builder, publishes it, and shares the link. Anyone with the link can fill it in at
`/forms/:formId`. The page reads the form definition from the API and renders the fields from that data, so a new
field or a new form never needs a change in the React code. Every submission is validated on the server against
the form definition before it is saved.

Built for the Full Stack Developer technical assessment (Dynamic Form Builder & Scalable Form Submission System).

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running the project](#running-the-project)
- [API documentation](#api-documentation)
- [Validation rules](#validation-rules)
- [Database design](#database-design)
- [State management (Redux)](#state-management-redux)
- [Security](#security)
- [Scaling notes](#scaling-notes)
- [Assumptions](#assumptions)

## Features

**Admin**
- Login with email and password (JWT).
- Dashboard with a paginated list of forms, filter tabs (All / Published / Drafts), and a submission count badge on each form.
- Create a form. New forms start with a starter set of fields: full name, email, gender, mobile, about you,
  department, designation and role. All of them can be edited or removed.
- Add, edit, remove and reorder fields (up / down).
- Per field: label, key, type, placeholder, default value, required, min/max length (text), min/max value (number),
  and options (dropdown, single choice, checkboxes).
- Save as draft or publish. A form without fields cannot be published.
- Copy the public link of a published form.
- View submissions per form (paginated), open a single submission, delete a submission.
- Delete a form (its submissions are deleted too).

**Public**
- Open `/forms/:formId` to fill in a published form. Draft or deleted forms show "This form is not available".
- Errors are shown under each field, first in the browser and then from the server.
- Confirmation screen after a successful submit.

**Live updates**
- The submissions list, the dashboard counts and the public form refresh on their own: instantly when the change
  happens in another tab of the same browser, when you switch back to the tab, and every 15 seconds otherwise.

**Supported field types:** `text`, `email`, `number`, `phone`, `textarea`, `date`, `select`, `radio`, `checkbox`

## Tech stack

| Part | Tools |
| --- | --- |
| Frontend | React 19, Vite, Redux Toolkit, React Router 7, Axios, Tailwind CSS 4 |
| Backend | Node.js 24, Express 4, Mongoose 8, zod, jsonwebtoken, bcryptjs |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize, xss |
| Database | MongoDB 6+ |

## Project structure

```
project/
├── client/                     React app
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── api/axios.js        Axios instance, adds the token, logs out on 401
│       ├── app/store.js        Redux store, saves the session to localStorage
│       ├── features/           One folder per Redux slice
│       │   ├── auth/
│       │   ├── forms/          Dashboard list
│       │   ├── formBuilder/    Form being edited + builder field type info
│       │   ├── formRenderer/   Public form
│       │   └── submissions/
│       ├── components/
│       │   ├── ui/             Button, Input, PasswordInput, Card, Alert, Icons
│       │   ├── fields/         Public field components, type -> component map, browser validation
│       │   └── ...             FieldEditor, FieldRenderer, Modal, ConfirmDialog, Pagination, Navbar, ...
│       ├── hooks/useAutoRefresh.js
│       ├── pages/              Login, Dashboard, FormBuilder, PublicForm, Submissions, SubmissionDetail, NotFound
│       ├── utils/              Date/value formatting, cross-tab sync channel
│       └── index.css           Tailwind import and theme colors
├── server/                     Express API
│   └── src/
│       ├── app.js              Middleware and routes
│       ├── server.js           Checks env, connects to MongoDB, starts the server
│       ├── config/             DB connection, starter fields for new forms
│       ├── models/             User, Form, Submission
│       ├── validators/
│       │   ├── fieldTypes.js            Field type registry: type -> parse/validate function
│       │   ├── formSchema.js            zod schema for a form definition
│       │   └── submissionValidator.js   Checks a submission against its form
│       ├── middleware/         auth, error handler, rate limits, ObjectId check
│       ├── controllers/        auth, forms, submissions
│       ├── routes/             auth, forms, submissions (nested under forms)
│       ├── scripts/seedAdmin.js
│       └── utils/              HttpError + catchAsync, pagination, xss cleaning
├── Postman_Collection.json
└── README.md
```

## Getting started

Requirements: Node.js 24 or higher, MongoDB 6+ (local or Atlas)

```bash
git clone <repository-url>
cd project

# API
cd server
npm install
create .env new file

# Client (from the project root)
cd ../client
npm install
create .env new file
```

Fill in `server/.env` (see the next section), then create the admin user:

```bash
cd server
npm run seed:admin
# Admin admin@example.com created
```

There is no sign-up page. The seed script is the only way to create an admin, so no credentials live in the code.
If the email already exists, the script does nothing.

> On Windows PowerShell, if `npm` fails with "running scripts is disabled on this system", run
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once, or use `npm.cmd` instead of `npm`.

## Environment variables

**server/.env**

| Variable | Required | Example | Description |
| --- | --- | --- | --- |
| `PORT` | no | `5000` | API port (default 5000) |
| `NODE_ENV` | no | `development` | |
| `MONGO_URI` | yes | `mongodb://127.0.0.1:27017/form_builder` | MongoDB connection string |
| `CLIENT_URL` | yes | `http://localhost:5173` | Allowed CORS origin |
| `JWT_SECRET` | yes | long random string | Signs the login tokens |
| `JWT_EXPIRES_IN` | no | `1d` | Token lifetime (default 1d) |
| `TRUST_PROXY` | no | `1` | Number of proxies in front of the API. Leave empty locally |
| `ADMIN_NAME` | no | `Admin` | Used by `seed:admin` |
| `ADMIN_EMAIL` | for seeding | `admin@example.com` | Used by `seed:admin` |
| `ADMIN_PASSWORD` | for seeding | min 8 characters | Used by `seed:admin` |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server loads `.env` with Node's built-in `--env-file-if-exists` flag, so `dotenv` is not needed. If `MONGO_URI`,
`JWT_SECRET` or `CLIENT_URL` is missing, the server stops at startup with a clear message.

**client/.env**

| Variable | Example | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | API base URL |

`.env` files are git-ignored. Only the `.env.example` files are committed.

## Running the project

Run the API and the client in two terminals:

```bash
# Terminal 1
cd server
npm run dev          # http://localhost:5000 (restarts on file changes)

# Terminal 2
cd client
npm run dev          # http://localhost:5173
```

Open http://localhost:5173/login and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

| Command | Where | What it does |
| --- | --- | --- |
| `npm run dev` | server | Start the API with `node --watch` |
| `npm start` | server | Start the API without watching |
| `npm run seed:admin` | server | Create the admin user from `.env` |
| `npm run dev` | client | Start the Vite dev server |
| `npm run build` | client | Production build into `client/dist` |
| `npm run preview` | client | Serve the production build locally |

Quick check that the API is up:

```bash
curl http://localhost:5000/api/health
# {"status":"ok"}
```

## API documentation

Base URL: `http://localhost:5000/api`

Admin routes need a token from the login endpoint:

```
Authorization: Bearer <token>
```

A ready-to-use Postman collection is in [`Postman_Collection.json`](Postman_Collection.json). Import it, set
`adminEmail` and `adminPassword` in the collection variables, and run **Auth > Login** first. It saves the token,
and later requests save `formId` and `submissionId` for you.

### Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | public | Health check |
| POST | `/auth/login` | public, rate limited | Log in, returns `{ token, user }` |
| POST | `/forms` | admin | Create a form |
| GET | `/forms` | admin | List your forms (paginated) |
| GET | `/forms/:id` | public if published, owner for drafts | Get a form definition |
| PUT | `/forms/:id` | admin (owner) | Replace the form (name, description, status, fields) |
| DELETE | `/forms/:id` | admin (owner) | Delete the form and its submissions |
| POST | `/forms/:formId/submissions` | public, rate limited | Submit a response |
| GET | `/forms/:formId/submissions` | admin (owner) | List submissions (paginated, newest first) |
| GET | `/forms/:formId/submissions/:id` | admin (owner) | Get one submission |
| DELETE | `/forms/:formId/submissions/:id` | admin (owner) | Delete one submission |

**Query parameters**

| Endpoint | Parameter | Default | Notes |
| --- | --- | --- | --- |
| `GET /forms` | `page` | 1 | |
| | `limit` | 10 | Max 50 |
| | `status` | all | `draft` or `published` |
| `GET /forms/:formId/submissions` | `page` | 1 | |
| | `limit` | 10 | Max 50 |

**Error format.** Every error has a `message`. Validation errors also include `errors`, keyed by field:

```json
{
  "message": "Please fix the highlighted fields",
  "errors": { "email": "Enter a valid email address" }
}
```

**Status codes:** `200` OK, `201` created, `204` deleted (no body), `400` validation error or invalid id,
`401` missing or expired token, `403` not an admin, `404` not found, `409` duplicate, `413` body over 100kb,
`429` rate limit hit, `500` server error.

### Examples

**Login**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourPassword123"}'
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6b05ae38801c7580526b1f4f",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-11-24T15:33:12.573Z",
    "updatedAt": "2026-11-24T15:33:12.573Z"
  }
}
```

**Create a form**

If `fields` is not sent, the form starts with the starter fields.

```bash
curl -X POST http://localhost:5000/api/forms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Registration",
    "status": "published",
    "fields": [
      { "key": "firstName", "label": "First Name", "type": "text", "required": true, "minLength": 2 },
      { "key": "email", "label": "Email", "type": "email", "required": true },
      { "key": "gender", "label": "Gender", "type": "select", "required": true, "options": ["Male", "Female", "Other"] }
    ]
  }'
```

Returns `201` with the saved form, including its `_id`.

**List forms**

```bash
curl "http://localhost:5000/api/forms?page=1&limit=10&status=published" -H "Authorization: Bearer <token>"
```

```json
{
  "items": [
    {
      "_id": "6b0c1f2a9e4d3b0012a4c7e1",
      "name": "Customer Registration",
      "status": "published",
      "publishedAt": "2026-11-25T09:12:44.120Z",
      "createdAt": "2026-11-25T09:12:44.120Z",
      "updatedAt": "2026-11-25T09:12:44.120Z",
      "submissionCount": 12
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1
}
```

**Get a form (public)**

```bash
curl http://localhost:5000/api/forms/6b0c1f2a9e4d3b0012a4c7e1
```

Visitors get `_id`, `name`, `description` and `fields`. The owner (with a token) gets the full document, drafts included.

**Update a form**

`PUT` replaces the whole definition, so send `name`, `status` and the full `fields` array.

```bash
curl -X PUT http://localhost:5000/api/forms/6b0c1f2a9e4d3b0012a4c7e1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Customer Registration", "status": "draft", "fields": [ ... ] }'
```

**Submit a response**

Values go inside `data`, keyed by field key.

```bash
curl -X POST http://localhost:5000/api/forms/6b0c1f2a9e4d3b0012a4c7e1/submissions \
  -H "Content-Type: application/json" \
  -d '{ "data": { "firstName": "Priya", "email": "priya.raman@example.com", "gender": "Female" } }'
```

```json
{ "_id": "6b0c2a7f9e4d3b0012a4c802", "createdAt": "2026-11-25T10:02:31.884Z" }
```

Invalid data returns `400`:

```json
{
  "message": "Please fix the highlighted fields",
  "errors": {
    "firstName": "Must be at least 2 characters",
    "email": "Enter a valid email address",
    "gender": "Choose one of the available options"
  }
}
```

**List submissions**

```bash
curl "http://localhost:5000/api/forms/6b0c1f2a9e4d3b0012a4c7e1/submissions?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

```json
{
  "items": [
    {
      "_id": "6b0c2a7f9e4d3b0012a4c802",
      "formId": "6b0c1f2a9e4d3b0012a4c7e1",
      "data": { "firstName": "Priya", "email": "priya.raman@example.com", "gender": "Female" },
      "createdAt": "2026-11-25T10:02:31.884Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1
}
```

**Delete a submission**

```bash
curl -X DELETE http://localhost:5000/api/forms/6b0c1f2a9e4d3b0012a4c7e1/submissions/6b0c2a7f9e4d3b0012a4c802 \
  -H "Authorization: Bearer <token>"
# 204 No Content
```

## Validation rules

Validation always runs on the server. The browser runs a copy of the main rules only to show errors faster.

**Form definition** (`server/src/validators/formSchema.js`, zod)
- Form name is required (max 150 characters). A form can have at most 100 fields.
- Each field needs a label and a key. The key must start with a letter and use only letters, numbers or `_` (max 50).
- Keys must be unique in the form, and the type must be one of the supported types.
- Dropdown, single choice and checkbox fields need at least one option, with no empty or repeated options.
- `minLength` must not be greater than `maxLength`, and `min` must not be greater than `max`.
- The default value must pass the field's own rules.
- A form cannot be published without fields.
- Unknown properties are dropped and text is stripped of HTML.

**Submission** (`server/src/validators/submissionValidator.js`)

| Type | Rule |
| --- | --- |
| all | Required fields must have a value |
| `text` / `textarea` | Min/max length if set, hard limit of 500 / 5000 characters |
| `email` | Valid email format, saved in lowercase |
| `number` | Must be a number, min/max if set |
| `phone` | 7 to 15 digits, optional leading `+`. Spaces, dashes, dots and brackets are removed before saving |
| `date` | Real date in `YYYY-MM-DD` format |
| `select` / `radio` | Must be one of the options |
| `checkbox` | Array of values, each one of the options |

Keys that are not on the form are dropped. Values like `{ "$gt": "" }` are rejected.

## Database design

Three collections.

**users**

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt hash, never returned in responses |
| `role` | String | `admin` or `user` |
| `createdAt`, `updatedAt` | Date | |

**forms**

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | |
| `description` | String | |
| `status` | String | `draft` or `published` |
| `fields` | Array | Embedded: `key`, `label`, `type`, `placeholder`, `defaultValue`, `required`, `options`, `minLength`, `maxLength`, `min`, `max` |
| `createdBy` | ObjectId | The admin who owns the form |
| `publishedAt`, `createdAt`, `updatedAt` | Date | |

Indexes: `{ createdBy: 1, createdAt: -1 }` (dashboard list), `{ status: 1, createdAt: -1 }`

**submissions**

| Field | Type | Notes |
| --- | --- | --- |
| `formId` | ObjectId | The form this answers |
| `data` | Object | `{ fieldKey: value }`, only keys defined on the form |
| `createdAt` | Date | |

Index: `{ formId: 1, createdAt: -1 }` (submissions of a form, newest first)

**Why fields are embedded and submissions are separate**
- Fields are always read and saved together with their form, in order. Embedding them means one read loads the whole
  definition. With at most 100 fields, a form stays far below MongoDB's 16MB document limit.
- Submissions grow without limit. Keeping them in their own collection means each submission is a small insert that
  does not touch the form, and they can be paginated by index, archived or sharded on their own.
- If a field is renamed or removed later, old answers are still kept. The submission detail page lists them separately
  under "Fields no longer on the form".

## State management (Redux)

The store is split into five slices, one per feature:

| Slice | Holds |
| --- | --- |
| `auth` | Token, logged-in user, login status |
| `forms` | Dashboard list (current page, totals), create / delete status |
| `formBuilder` | Working copy of the form being edited, unsaved-changes flag, load / save status, errors per field |
| `formRenderer` | Public form definition, submit status |
| `submissions` | Form used for labels, current page of submissions, selected submission, delete status |

All API calls are `createAsyncThunk`s. Each slice tracks `idle / loading / succeeded / failed` and an error message.

**Kept in Redux:** data from the server, the session, the form being built (several components edit it and the save
thunk needs all of it), and request status that more than one component reads.

**Kept in local `useState`:** values typed into the public form and their errors, open/closed state of modals and field
cards, the item waiting for delete confirmation, the "Add field" type picker, the new form name, and short-lived
messages like "Draft saved." This state belongs to one component and is thrown away when it unmounts.

## Security

- **Auth:** JWT in the `Authorization: Bearer` header, signed with `JWT_SECRET`, with an expiry. Admin routes check the
  token (`401`) and the `admin` role (`403`). An admin only sees their own forms; other forms return `404`.
- **Passwords:** hashed with bcrypt (12 rounds) in the User model, never sent in responses. Login gives the same message
  for a wrong email or a wrong password.
- **Input:** zod for form definitions, type-based checks for submissions, a whitelist of keys, HTML stripped with `xss`,
  a 100kb JSON body limit, ObjectId format checked before any query, and `express-mongo-sanitize` against operator injection.
- **Headers and CORS:** `helmet`, and CORS limited to `CLIENT_URL`.
- **Rate limits** (per IP):

  | Scope | Limit |
  | --- | --- |
  | All `/api` routes | 300 requests / 15 min |
  | Login | 10 failed attempts / 15 min |
  | Public submissions | 10 / min |

- **Secrets:** only in `.env` files, which are git-ignored.
- **Errors:** unexpected errors are logged on the server, and the client only gets a generic `500` message.

## Scaling notes

What the current version does, and how it would grow.

**50,000+ forms**
- A form is one small document. The dashboard query uses the `{ createdBy, createdAt }` index and does not load `fields`.
- The public page loads a form by `_id`. Published forms change rarely, so they can be cached in Redis (`form:{id}`) and
  the key cleared on update or delete.

**10 million+ submissions**
- Submissions are small insert-only documents in their own collection. Every list query uses the `{ formId, createdAt }` index.
- The dashboard count is one grouped query for the 10 forms on the page. For very large forms, a `submissionCount`
  field updated with `$inc` would be cheaper.
- Beyond a single server, shard `submissions` on `formId` and move old data to an archive collection.

**High submission traffic**
- The API is stateless (JWT), so more instances can run behind a load balancer.
- A submission is one validation and one insert. With the form cached it is a single database write.
- The rate limiter keeps counts in memory per instance. With several instances, use a Redis store (`rate-limit-redis`).

**Pagination**
- Lists use `page` / `limit` with `skip`, capped at 50 per page. This is fine for the admin screens.
- For very deep pages, switch to cursor pagination on `(createdAt, _id)` so each page reads only `limit` documents.

**Indexes**
- Check a query plan with:
  ```js
  db.submissions.find({ formId: ObjectId('...') }).sort({ createdAt: -1 }).limit(10).explain('executionStats')
  ```
  It should show `IXSCAN`, not `COLLSCAN`.

**Background jobs**
- Emails, webhooks, exports and deleting the submissions of a deleted form should move to a queue
  (BullMQ + Redis) and run in a separate worker with retries.

## Assumptions

- Only admins use the builder, and each admin manages only the forms they created.
- `PUT /api/forms/:id` replaces the whole form definition.
- A published form can still be edited. Changes apply to new submissions, and old submissions keep their data.
- Saving a form as draft hides it from the public until it is published again.
- Phone numbers are 7 to 15 digits. Dates use the `YYYY-MM-DD` format from `<input type="date">`.
- Deleting a form also deletes its submissions.
- The token is stored in localStorage to keep the setup simple. An httpOnly cookie would be the stricter option.
