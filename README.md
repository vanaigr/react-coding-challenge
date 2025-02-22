# React Coding Challenge

https://gist.github.com/TheCodingCanal/e991fcdcd2be75c3a2676fd425173c02

<details>

<summary>Images</summary>

![image](https://github.com/user-attachments/assets/3d707071-a925-4c70-b15c-a2e2a16e7c38)
![image](https://github.com/user-attachments/assets/713c8f13-37ba-4bd8-8a72-efc81dc79c34)
![image](https://github.com/user-attachments/assets/1fffa1c9-a7c9-406f-99dd-66877ae63757)
![image](https://github.com/user-attachments/assets/a5d8e50d-93c3-4d76-86c7-187b32b0a9a1)
![image](https://github.com/user-attachments/assets/5bd77a14-f368-4983-a430-187c9cea90fa)
![image](https://github.com/user-attachments/assets/a89bdbf5-265a-4bb0-b44d-1d685b8f58e2)

   
</details>

## Setup Instructions

### Prerequisites

This project was developed on Linux using Node.js 20 and [`pnpm`](https://pnpm.io/) as the package manager,
but I've confirmed it also works on Windows and with `npm` (with some changes to commands).

For Windows, `dev`, etc., commands need to include `--shell-emulator` (after optional `run` and before the command).
For `npm`, some commands require `npm run`, e.g. `npm run dev` instead of `npm dev`.

The project uses [`Prisma Schema`](https://www.prisma.io/docs/orm/prisma-schema), which generates type-checked client for database queries. Install `Prisma` with the following command:

```shell
pnpm i -g prisma
```

Testing requires [`Playwright`](https://playwright.dev/), which can be installed with these commands:

```sell
pnpm i -g playwright
pnpm exec playwright install
```

Linting requires [`Biome`](https://biomejs.dev):

```shell
pnpm i -g biome
```

### Installation steps

After cloning the repo, run the following commands in the root directory:

```shell
echo DATABASE_URL='file:./dev.db' > .env
pnpm exec prisma generate
```

### How to run the application

To start development server, execute:

```shell
pnpm dev
```

The app is served at `http://localhost:3000/`

### How to run tests

Before running the tests, execute this command and wait until the server is started:

```shell
pnpm dev-test
```

To run e2e tests, execute:

```shell
pnpm exec playwright test
```

To run API endpoints tests, execute:

```shell
pnpm test-api
```

### Linting

Application code:

```
pnpx @biomejs/biome check ./src
```

Tests:

```
pnpx @biomejs/biome check ./test
```

### Type checking

```
pnpm exec tsc -b
```

## Features Implementation

### List of completed features

1. Dashboard:
    * Equipment status breakdown pie chart
    * Maintenance hours by department bar chart
    * Recent maintenance activities
    * Configurable cutoff date for maintenance hours and recent maintenance
2. Equipment table:
    * Displays all equipment with columns for all fields
    * All columns can be sorted and filtered
    * Rows are colored based on status (Operational - green, Down - red, Maintenance - yellow, Retired - blue)
    * Status can be changed for multiple rows by selecting them and using the "Change status" dropdown
    * Each row has a link to the corresponding equipment form page
3. Equipment form:
    * Fields are validated
    * Supports creating and editing records
4. Maintenance Records Table:
    * Displays all maintenance records with columns for all fields
    * Displays the name of the corresponding equipment for each record
    * All columns can be sorted and filtered
    * Records can be groupded by equipment id
    * Each row has links to the corresponding maintenance record and equipment form pages
5. Maintenance Record Form:
    * Fields are validated
    * Supports creating and editing records
6. Database:
    * SQLite database with `Equipment`, `MaintenanceRecord`, and `MaintenanceRecordParts` tables
    * Prisma schema
    * `Equipment` is connected to `MaintenanceRecord`, `MaintenanceRecord` to `MaintenanceRecordParts`
7. Equipment API Endpoints
    * Get all equipment (`GET` `/api/equipment`)
    * Insert equipment (`POST` `/api/equipment`)
    * Get equipment by id (`GET` `/api/equipment/{id}`)
    * Update equipment by id (`PUT` `/api/equipment/{id}`)
    * Delete equipment by id (`DELETE` `/api/equipment/{id}`)
8. Maintenance Record API Endpoints
    * Get all maintenance records (`GET` `/api/maintenance`)
    * Insert a maintenance record (`POST` `/api/maintenance`)
    * Get maintenance record by id (`GET` `/api/maintenance/{id}`)
    * Update maintenance record by id (`PUT` `/api/maintenance/{id}`)
    * Delete maintenance record by id (`DELETE` `/api/maintenance/{id}`)
9. Tests:
    * All 4 equipment management tests
    * All 4 maintenance record tests
    * Equipment API endpoints tests
    * Maintenance API endpoints test

## Testing Approach

`Playwright` is used for e2e tests. `Jasmine` is used for API endpoints tests.

### How to run different types of tests

Before running the tests, execute this command and wait until the server is started:

```shell
pnpm dev-test
```

To run e2e tests, execute:

```shell
pnpm exec playwright test
```

To run API endpoints tests, execute:

```shell
pnpm test-api
```

## Technical Decisions

### Key libraries used and why

These libraries were required in the project description:
* [`Next.js`](https://nextjs.org/)
* [`React.js`](https://react.dev/)
* [`Recharts`](https://recharts.org/)
* [`TanStack Table`](https://tanstack.com/table/latest)
* [`Zod`](https://zod.dev/)
* [`Prisma Schema`](https://www.prisma.io/docs/orm/prisma-schema)
* [`Tailwind CSS`](https://tailwindcss.com/)
* [`Playwright`](https://playwright.dev/)

[`Zustand`](https://zustand-demo.pmnd.rs/) was used for keeping field and validation state in forms,
since there isn't much client state in the app and the library provides convenient API.

[`Material Symbols`](https://fonts.google.com/icons) for icons.

[`Jasmine`](https://jasmine.github.io/) for testing, since Mocha [doesn't support ESM config files](https://mochajs.org/#nodejs-native-esm-support).

### State management approach

Data is persisted in the SQLite DB. I picked SQLite because it is easy to substitute when testing, and it doesn't require external dependencies.

Frontend has little state, and for simplicity it is stored as local component state.

## Known Issues/Limitations

### Current bugs or limitations

* UTC is used as the timezone for checking validity of dates. Otherwise users in different timezones may disagree on whether a given record is valid, even when is from the DB.
* No UI for deleting records.

### Future improvements

* Errors for some of the more obscure scenarios aren't shown to the user. E.g. when adding a maintenance record that references equipment that was deleted after the form was opened.
* Indicate to the user that table data is stale if it is updated after loading the page.
* Links from equipment to their maintenance records.
* Support vertical screens

## Bonus Features (if implemented)

### Description of extra features

1. SQL database.
2. Prisma schema.
3. CRUD endpoints for equipment and maintenance records.
4. Relationships between tables

### How to use them

Database is always used for storage.

API endpoints can be used by sending HTTP requests to `/api/*` routes
(note that only server's domain is allowed by CORS), or by running the
API tests (described in "Testing Approach").
