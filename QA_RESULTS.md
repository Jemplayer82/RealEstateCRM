# QA Test Results — RealEstateCRM
**Date**: 2026-04-12
**Tester**: Automated (Claude Sonnet 4.6)
**App URL**: http://192.168.1.19:3000
**Login Used**: landon@txferguson.net / TestAdmin1!

---

## Summary
- Total pages tested: 17
- Total functional tests run: ~45
- Passed: 14
- Failed: 31
- Bugs found: 18

---

## Root Cause — Critical Infrastructure Bug

**ALL API calls are hardcoded to `localhost:3000` instead of using the host the frontend is served from (`192.168.1.19:3000`).** This means every backend call fails with HTTP 503 when the app is accessed from any machine other than the server itself. This single misconfiguration causes the majority of all other failures. The frontend `.env` or API base URL config must be updated to use a relative path or the correct host.

---

## Bugs Found

| # | Severity | Page/Feature | Description | Steps to Reproduce |
|---|----------|-------------|-------------|-------------------|
| 1 | Critical | All pages | API base URL hardcoded to `localhost:3000` — all API calls return 503 when accessed remotely | Access app from any machine other than the server; observe all network requests fail with 503 |
| 2 | Critical | /auth/sign-in | Login fails entirely — `POST localhost:3000/api/user/login` returns 503; users cannot log in after logout | Log out, then attempt to sign back in with valid credentials |
| 3 | High | /contacts | "Add Contact" modal opens but form body is completely empty — no fields render at all (only title bar and Save/Close buttons) | Navigate to /contacts, click "+ Add New" |
| 4 | High | /properties | Page content area renders completely blank — no table, no toolbar, no "Add New" button, no "No Data Found" message | Navigate to /properties |
| 5 | High | /lead | "Add Lead" form dropdowns ("Associated Listing", "Assign to User") are empty because their data APIs (`/api/property`, `/api/user/`) return 503 | Navigate to /lead, click "+ Add New", observe empty dropdowns |
| 6 | High | /lead | Clicking "Save" with empty required fields gives no validation feedback and makes no API call — silent failure | Open Add Lead modal, click Save without filling any fields |
| 7 | High | /opportunities, /account, /invoices, /task, /metting, /email | Pages render column headers but data area shows infinite spinner — never resolves to "No Data Found" or actual data | Navigate to any of these pages and wait |
| 8 | High | /email | Wrong API called: page calls `GET /api/property` twice instead of an email endpoint | Navigate to /email, check network requests |
| 9 | Medium | /default (Dashboard) | Right half of dashboard is completely empty — only "Module Data Report" chart renders (left side), module summary cards or other widgets are missing | Navigate to /default |
| 10 | Medium | /default (Dashboard) | "Module Data Report" chart renders with no axis labels and no data (bars are placeholder-colored) due to `GET localhost:3000/api/modules` returning 503 | Navigate to /default |
| 11 | Medium | /email-template | Page title in header shows "Emails" instead of "Email Templates" | Navigate to /email-template, observe the page heading |
| 12 | Medium | /role-access | Route `/role-access` does not exist as a standalone page — navigating to it silently redirects to `/default` (Dashboard) with no error message | Navigate directly to http://192.168.1.19:3000/role-access |
| 13 | Low | /opportunities | Page subtitle label reads "Opprtunities (0)" — missing the letter 'o' (typo) | Navigate to /opportunities, observe the table header label |
| 14 | Low | /phone-call, /email | Column header reads "Realeted To" — should be "Related To" (typo) | Navigate to /phone-call or /email, observe column headers |
| 15 | Low | /calender | Route URL is `/calender` and page title reads "Calender" — both misspell "Calendar" | Navigate to /calender, observe URL and heading |
| 16 | Low | /metting | Route URL is `/metting` — misspells "Meeting" (missing second 'e') | Navigate to /metting, observe URL |
| 17 | Low | /auth/sign-in | Email placeholder text reads "mail@simmmple.com" — "simmmple" has three m's (typo) | Navigate to /auth/sign-in, observe email field placeholder |
| 18 | Low | /admin-setting | Button label reads "Active Deactive Module" — should be "Activate / Deactivate Module" | Navigate to Admin Settings, observe the module management card |

---

## Detailed Test Results

### Phase 1: Authentication
- [x] Login page renders correctly at `/auth/sign-in` — PASS
- [x] Login page has Email, Password fields and "Keep me logged in" checkbox — PASS
- [x] Logout works — clicking Log Out redirects to `/auth/sign-in` — PASS
- [ ] Login after logout fails — `POST localhost:3000/api/user/login` returns 503 — FAIL
- [ ] Email field placeholder typo: "mail@simmmple.com" (extra m's) — FAIL (cosmetic)

### Phase 2: Dashboard (/default)
- [x] Page loads and renders without crashing — PASS
- [x] "Module Data Report" chart widget renders — PASS
- [ ] Chart has no data and no axis labels (API fails) — FAIL
- [ ] Right half of dashboard is blank — missing widgets or summary cards — FAIL
- [ ] `GET localhost:3000/api/modules` returns 503 — FAIL

### Phase 3: Leads (/lead)
- [x] Page loads and renders list table with headers — PASS
- [x] "Leads (0)" count shown; "No Data Found" displayed correctly — PASS
- [x] "+ Add New" button opens side panel modal — PASS
- [ ] Add Lead dropdowns empty — dependent APIs return 503 — FAIL
- [ ] Save with empty fields shows no validation error — FAIL
- [ ] `GET localhost:3000/api/lead/` returns 503 — FAIL

### Phase 4: Contacts (/contacts)
- [x] Page loads — PASS
- [x] "Contacts (0)" with "No Data Found" shown — PASS
- [x] "+ Add New" button opens panel — PASS
- [ ] Add Contact modal body is completely empty (no form fields) — FAIL (Critical)
- [ ] `GET localhost:3000/api/contact/` fails — FAIL

### Phase 5: Properties (/properties)
- [ ] Page content area renders completely blank — no table, toolbar, or "Add New" visible — FAIL
- [ ] `GET localhost:3000/api/property/` and `GET localhost:3000/api/custom-field/?moduleName=Properties` both fail — FAIL

### Phase 6: Opportunities (/opportunities)
- [x] Page loads with column headers (Opportunity Name, Account Name, Amount, Close Date, Sales Stage) — PASS
- [ ] Table shows indefinite spinner, never resolves — FAIL
- [ ] Page subtitle has typo: "Opprtunities" — FAIL (cosmetic)
- [ ] `GET localhost:3000/api/opportunity/` fails — FAIL

### Phase 7: Account (/account)
- [x] Page loads with column headers (Account Name, Office Phone, Fax, Email Address) — PASS
- [ ] Table shows indefinite spinner — FAIL
- [ ] `GET localhost:3000/api/account/` fails — FAIL

### Phase 8: Invoices (/invoices)
- [x] Page loads with column headers (Invoice Number, Title, Status, Contact, Account, Grand Total) — PASS
- [ ] Table shows indefinite spinner — FAIL
- [ ] `GET localhost:3000/api/invoices/` fails — FAIL

### Phase 9: Tasks (/task)
- [x] Page loads with column headers (Title, Related, Status, Assign To, Start Date, End Date) — PASS
- [ ] Table shows indefinite spinner — FAIL
- [ ] `GET localhost:3000/api/task` fails — FAIL

### Phase 10: Meetings (/metting)
- [x] Page loads with column headers (Agenda, Date & Time, Time Stamp, Create By) — PASS
- [ ] Table shows indefinite spinner — FAIL
- [ ] Route URL `/metting` is misspelled — FAIL (cosmetic)
- [ ] `GET localhost:3000/api/meeting` fails — FAIL

### Phase 11: Phone Calls (/phone-call)
- [x] Page loads with column headers — PASS
- [x] "No Data Found" message shows (better than infinite spinner) — PASS
- [ ] Column header "Realeted To" is a typo — FAIL (cosmetic)
- [ ] `GET localhost:3000/api/phoneCall` fails — FAIL

### Phase 12: Emails (/email)
- [x] Page loads with column headers — PASS
- [ ] Table shows indefinite spinner — FAIL
- [ ] Wrong API called: `/api/property` fetched instead of an email endpoint — FAIL
- [ ] "Realeted To" column header typo — FAIL (cosmetic)

### Phase 13: Email Templates (/email-template)
- [x] Page loads with column headers (Template Name, Description) — PASS
- [ ] Table shows indefinite spinner — FAIL
- [ ] Page heading shows "Emails" instead of "Email Templates" — FAIL (cosmetic)
- [ ] "Advance Search" button absent (present on all other list pages) — FAIL
- [ ] `GET localhost:3000/api/email-temp/` fails — FAIL

### Phase 14: Calendar (/calender)
- [x] Calendar renders with correct current month (April 2026) — PASS
- [x] Today (April 12) highlighted correctly — PASS
- [x] Month/Week/Day/List/Multi Month view switchers present — PASS
- [x] Calls/Meetings/Emails legend shown — PASS
- [ ] Route URL `/calender` is a misspelling of "calendar" — FAIL (cosmetic)
- [ ] Page title "Calender" is misspelled — FAIL (cosmetic)
- [ ] `GET localhost:3000/api/calendar/` fails (no events load) — FAIL
- [ ] JavaScript exception in calendar chunk: `TypeError: (intermediate value) is not iterable` — FAIL

### Phase 15: Role Access (/role-access and /role)
- [ ] Navigating to `/role-access` silently redirects to `/default` — no such route exists — FAIL
- [x] Roles page accessible via Admin Settings > Roles at `/role` — PASS
- [x] Roles page shows correct table headers (Role Name, Description) — PASS
- [x] "No Data Found" shown correctly — PASS
- [ ] `GET localhost:3000/api/role-access` returns 503 — FAIL

### Phase 16: Users (/user)
- [x] Page loads with column headers (Email Id, First Name, Last Name, Role) — PASS
- [ ] Table shows indefinite spinner — FAIL
- [ ] Unusual "Back" button on list page (no clear navigation context) — FAIL (UX)
- [ ] `GET localhost:3000/api/user/` fails — FAIL

### Phase 17: Admin Settings (/admin-setting)
- [x] Admin Settings page accessible via profile menu — PASS
- [x] All 8 setting tiles render (Users, Roles, Change Images, Custom Fields, Validations, Table Fields, Module, Active Deactive Module) — PASS
- [ ] "Active Deactive Module" tile label is grammatically incorrect — FAIL (cosmetic)

---

## Environment & Configuration Notes

- **Frontend served at**: http://192.168.1.19:3000
- **API base URL (hardcoded)**: http://localhost:3000
- **Effect**: Every API call fails with HTTP 503 when accessed remotely. This is the single highest-priority fix needed. The frontend build configuration (likely `REACT_APP_API_URL` or equivalent in `.env`) must be updated to use a relative URL (e.g., `/api/`) or set to the correct network address.
- **65+ console errors** of type `API request failed: unknown` were accumulated during the test session.
- **1 JavaScript exception** found: `TypeError: (intermediate value)(intermediate value)(intermediate value) is not iterable` in `1114.f3af79ba.chunk.js` (calendar-related chunk).

---

## Recommendations (Priority Order)

1. **[Critical]** Fix API base URL — change from `http://localhost:3000` to a relative path `/api/` or environment-configurable variable so the app works when deployed to any host.
2. **[Critical]** Fix "Add Contact" modal — form fields are not rendering. Investigate why the form body is empty.
3. **[High]** Fix Properties page — the entire content area is blank; the component is likely failing to mount.
4. **[High]** Fix spinner states on Opportunities, Account, Invoices, Tasks, Meetings, Email pages — implement proper error/empty states when API calls fail, rather than leaving an infinite spinner.
5. **[High]** Fix Email page — it is calling `/api/property` instead of the email API endpoint.
6. **[High]** Add form validation feedback to Add Lead (and all create forms) — silent no-op on Save is confusing.
7. **[Medium]** Fix Email Template page title ("Emails" → "Email Templates").
8. **[Medium]** Add a proper 404 page or redirect message for `/role-access` route.
9. **[Medium]** Fix Dashboard — restore missing widgets/cards on the right half.
10. **[Low]** Fix all typos in routes and UI labels: `/calender` → `/calendar`, `/metting` → `/meeting`, "Opprtunities" → "Opportunities", "Realeted To" → "Related To", "Active Deactive" → "Activate/Deactivate", email placeholder "simmmple.com".
