# Real Estate CRM — User Guide & FAQ

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Properties](#2-properties)
3. [Contacts](#3-contacts)
4. [Leads](#4-leads)
5. [Tasks](#5-tasks)
6. [Meetings](#6-meetings)
7. [Phone Calls](#7-phone-calls)
8. [Opportunities](#8-opportunities)
9. [Accounts](#9-accounts)
10. [Email Templates](#10-email-templates)
11. [Common Workflows](#11-common-workflows)
12. [Tips and Troubleshooting](#12-tips-and-troubleshooting)

---

## 1. Getting Started

### What is this CRM?
This is a Real Estate CRM built with React (frontend) and Node.js/Express/MongoDB (backend). It is designed to manage the full lifecycle of real estate sales: tracking properties, contacts, leads, meetings, calls, and deals in one place.

### How do I log in?
Navigate to the app URL (e.g. `http://localhost:3000`). Enter your email and password on the login screen. Your session token is stored in `localStorage` under the key `token`.

### What roles exist?
- **superAdmin** — sees all records across all users.
- **Regular user** — sees only records they created or are assigned to.

### How is the sidebar organized?
The left sidebar contains icons linking to each module. From top to bottom: Dashboard, Reports, Properties, Contacts, Leads, Opportunities, Accounts, Documents, Tasks, Meetings, Phone Calls, Email Templates, Email History, Calendar.

### How do I search for records?
Every module list page has a **Search** bar at the top for quick text search, and an **Advance Search** button that opens a filter panel with module-specific fields.

### How do I switch between list and grid view?
Use the view-toggle icon near the top-right of each module list page (to the left of the **+ Add New** button).

---

## 2. Properties

**URL:** `/properties`

### What is the Properties module used for?
Track real estate listings — residential, commercial, or rental. Each property record stores physical details, pricing, photos, documents, and associated contacts.

### How do I add a new property?
1. Navigate to **Properties** in the sidebar.
2. Click **+ Add New**.
3. Fill in the required fields and click **Save**.

### What fields are available?

#### Required fields
| Field | Description |
|---|---|
| Property Type | Type of property (e.g. Residential, Commercial, Rental) |
| Property Address | Full street address |
| Listing Price | Asking price in dollars |
| Square Footage | Total area in square feet |
| Number of Bedrooms | Integer count |
| Number of Bathrooms | Integer count |
| Year Built | Four-digit year (1000 to current year) |
| Property Description | Free-text description of the property |

#### Optional fields
| Section | Fields |
|---|---|
| Features & Amenities | Lot Size, Parking Availability, Appliances Included, Heating and Cooling Systems, Flooring Type, Exterior Features, Community Amenities |
| Media & Visuals | Property Photos, Virtual Tours or Videos, Floor Plans, Property Documents |
| Listing & Marketing | Listing Status, Listing Agent or Team, Listing Date, Marketing Description, Multiple Listing Service (MLS) |
| Property History | Previous Owners, Purchase History |
| Financial Information | Property Taxes, HOA Fees, Mortgage Information |
| Associated Contacts | Sellers, Buyers, Property Managers, Contractors or Service Providers |
| Notes | Internal Notes or Comments |

### How do I edit or delete a property?
Click the three-dot **Action** menu at the far right of a property row, then choose **Edit** or **Delete**.

### Sample record
- **123 Oak Street** — Residential, 3 bed/2 bath, 1,800 sq ft, $350,000, Austin TX 78701

---

## 3. Contacts

**URL:** `/contact`

### What is the Contacts module used for?
Store information about individuals — buyers, sellers, investors, or other people associated with real estate transactions. Contacts differ from Leads in that they represent people already in a working relationship with you.

### How do I add a new contact?
1. Navigate to **Contacts** in the sidebar.
2. Click **+ Add New**.
3. Fill in the required fields and click **Save**.

### What fields are available?

#### Required fields
| Field | Description |
|---|---|
| First Name | Minimum 2 characters |
| Last Name | Minimum 2 characters |
| Title | Professional title (e.g. Mr., Ms., Dr.) |
| Email | Valid email address |
| Phone Number | 10–12 digit number (numeric, no dashes or spaces) |
| Physical Address | Street address |
| Preferred Contact Method | How the contact prefers to be reached |

#### Optional fields
| Section | Fields |
|---|---|
| Lead Source | Lead Source, Referral Source, Campaign Source |
| Status | Lead Status, Lead Rating, Lead Conversion Probability |
| History | Email History, Phone Call History, Meeting History, Notes and Comments |
| Personal Info | Date of Birth, Gender, Occupation, Interests or Hobbies |
| Communication | Communication Frequency, Preferences |
| Social Media | LinkedIn, Facebook, Twitter, Other Profiles |
| Assignment | Agent or Team Member, Internal Notes |
| Important Dates | Birthday, Anniversary, Key Milestones |

### Important: Phone number format
Phone numbers must be entered as plain digits with no dashes, spaces, or parentheses (e.g. `5125550101` not `512-555-0101`). The field is stored as a Number type.

### Sample records
- **Sarah Johnson** — sarah.johnson@email.com, 5125550101
- **Mike Davis** — mike.davis@email.com, 5125550202

---

## 4. Leads

**URL:** `/leads`

### What is the Leads module used for?
Track prospective buyers or sellers who have expressed interest but have not yet become clients. Leads can be converted to contacts once qualified.

### How do I add a new lead?
1. Navigate to **Leads** in the sidebar.
2. Click **+ Add New**.
3. Fill in the required fields and click **Save**.

### What fields are available?

#### Required fields
| Field | Description |
|---|---|
| Lead Name | Full name of the prospective client |
| Lead Email | Valid email address |
| Lead Phone Number | 10–12 digit number (numeric only) |
| Lead Address | Street address |
| Lead Creation Date | Date the lead was created |
| Lead Conversion Date | Expected or actual conversion date |
| Lead Follow-Up Date | Next scheduled follow-up date |
| Lead Score | Numeric score (0 or above) |
| Lead Conversion Rate | Numeric percentage |

#### Optional fields
| Section | Fields |
|---|---|
| Source | Lead Source, Lead Source Details, Campaign, Channel, Medium, Referral |
| Assignment | Lead Assigned Agent, Lead Owner, Communication Preferences |
| Follow-up | Follow-Up Status, Nurturing Workflow, Engagement Level, Nurturing Stage, Next Action |
| Status | Lead Status |

### What lead status values are available?
Common values include: **New**, **Contacted**, **Qualified**, **Converted**, **Unqualified**. The status can be set in the Lead Status field on the add/edit form.

### Sample records
- **James Wilson** — james.wilson@email.com, 5125550301, Status: Active
- **Emily Chen** — emily.chen@email.com, 5125550302, Status: Active

---

## 5. Tasks

**URL:** `/tasks`

### What is the Tasks module used for?
Manage to-dos and follow-up actions related to properties, contacts, and leads. Tasks appear on the calendar view as well.

### How do I add a new task?
1. Navigate to **Tasks** in the sidebar.
2. Click **+ Add New**.
3. Fill in the required fields in the task form.
4. Click **Save**.

### What fields are available?

| Field | Required | Description |
|---|---|---|
| Title | Yes | Short description of the task |
| Start Date | Yes | When the task begins (date/time picker) |
| End Date | No | When the task is due |
| Category | No | Category label for the task |
| Description | No | Detailed description |
| Notes | No | Internal notes |
| Reminder | No | Reminder notification setting |
| Background Color | No | Calendar display color |
| Border Color | No | Calendar border color |
| Text Color | No | Calendar text color |

### How do tasks appear on the calendar?
Each task with a start date appears on the **Calendar** page (accessible via the calendar icon in the sidebar). Colors set in the task form control how the event is displayed.

### Sample records
- **Follow up with Sarah Johnson** — start date 2026-04-20
- **Schedule property viewing - 123 Oak Street** — start date 2026-04-22

---

## 6. Meetings

**URL:** `/metting`

### What is the Meetings module used for?
Schedule and track meetings with leads or contacts — property showings, consultations, negotiations, and other appointments.

### How do I add a new meeting?
1. Navigate to **Meetings** in the sidebar.
2. Click **+ Add New**.
3. Fill in the Agenda, select Related To (Contact or Lead), choose an attendee, set Location and Date/Time.
4. Click **Save**.

### What fields are available?

| Field | Required | Description |
|---|---|---|
| Agenda | Yes | Meeting subject or title |
| Related To | Yes | Whether the meeting is linked to a Contact or a Lead |
| Attendees | Yes | Select at least one contact or lead from the typeahead or the selection modal |
| Location | No | Physical or virtual meeting location |
| Date Time | Yes | Date and time of the meeting |
| Notes | No | Additional notes about the meeting |

### How do I select an attendee?
After selecting **Contact** or **Lead** as the related type, a "Choose Preferred Attendees" search field appears. Type a name to filter the list, then click the name to select them. You can also click the **pointer icon** button to the right to open a full selection modal.

### Why does the form say "Select Related To" when I try to save?
This error appears when no attendee has been selected. You must select at least one contact (if Related To = Contact) or one lead (if Related To = Lead) before saving.

### Sample record
- **Initial consultation with James Wilson** — Related to Lead: James Wilson, Location: Office - 100 Congress Ave Austin TX 78701, Date: 2026-04-25 10:00 AM

---

## 7. Phone Calls

**URL:** `/phone-call`

### What is the Phone Calls module used for?
Log outbound and inbound calls made to leads or contacts. Records include who called, who was called, duration, and notes.

### How do I add a phone call record?
Phone calls are typically logged from within a Lead or Contact detail view. You can also:
1. Navigate to **Phone Calls** in the sidebar.
2. Click **+ Add New**.
3. Fill in recipient, start date, call duration, and assign a sales agent.
4. Click **Save**.

### What fields are available?

| Field | Required | Description |
|---|---|---|
| Recipient | Yes | Phone number of the person called (auto-filled from lead/contact) |
| Start Date | Yes | Date and time the call started |
| Call Duration | Yes | Length of the call (e.g. "15 minutes") |
| Sales Agent | Yes | The user responsible for the call |
| Call Notes | No | Summary of what was discussed |
| Related To | Auto | Linked lead or contact ID |

### Why is the Recipient field disabled?
The Recipient field is populated automatically from the linked lead or contact record and is read-only. To log a call for a specific lead or contact, open that record's detail page and use the Add Call button there.

### Sample record
- Recipient: 5125550301, Related To: Lead (James Wilson), Duration: 15 minutes, Notes: Discussed property requirements and available listings

---

## 8. Opportunities

**URL:** `/opportunities`

### What is the Opportunities module used for?
Track active sales deals. Each opportunity represents a potential transaction, typically linked to a property or account, with a sales stage and expected close date.

### How do I add a new opportunity?
1. Navigate to **Opportunities** in the sidebar.
2. Click **+ Add New**.
3. Fill in the required fields and click **Save**.

### What fields are available?

#### Required fields
| Field | Description |
|---|---|
| Opportunity Name | Name of the deal (e.g. "123 Oak Street Sale") |
| Opportunity Amount | Dollar value of the deal |
| Expected Close Date | Target date to close the deal |
| Sales Stage | Current stage in the pipeline |

#### Optional fields
| Field | Description |
|---|---|
| Account Name | Linked account |
| Type | Deal type classification |
| Lead Source | Where the lead originated |
| Currency | Currency for the amount |
| Amount | Secondary amount field |
| Next Step | What action comes next |
| Probability | Likelihood of closing (percentage) |
| Description | Free-text notes about the deal |
| Assign User | Team member responsible |

### What sales stage values are typically used?
Common stages include: **Prospecting**, **Qualification**, **Needs Analysis**, **Value Proposition**, **Proposal/Price Quote**, **Negotiation/Review**, **Closed Won**, **Closed Lost**.

### Sample record
- **123 Oak Street Sale** — Amount: $350,000, Stage: Prospecting, Expected Close: 2026-06-30

---

## 9. Accounts

**URL:** `/account`

### What is the Accounts module used for?
Manage organizations — real estate companies, investment groups, developers, or corporate clients. Accounts can be linked to Opportunities and Contacts.

### How do I add a new account?
1. Navigate to **Account** in the sidebar.
2. Click **+ Add New**.
3. Fill in the required Account Name and any other relevant fields.
4. Click **Save**.

### What fields are available?

#### Required fields
| Field | Description |
|---|---|
| Account Name | Name of the organization |

#### Optional fields
| Section | Fields |
|---|---|
| Contact Info | Office Phone (10 digits), Alternate Phone, Website (URL), Email Address, Non-Primary Email, Fax |
| Classification | Ownership, Type, Industry, Annual Revenue, Rating, SIC Code |
| Billing Address | Street, Street 2–4, City, State, Postal Code (6 digits), Country |
| Shipping Address | Street, Street 2–4, City, State, Postal Code, Country |
| Other | Description, Member Of (parent account), Assign User, Email Opt Out, Invalid Email |

### Sample record
- **Wilson Real Estate Group** — Phone: 5125550400, Email: info@wilsonrealestategroup.com, Industry: Real Estate, Billing: 500 W 5th Street, Austin TX 78701

---

## 10. Email Templates

**URL:** `/email-template`

### What is the Email Templates module used for?
Create reusable email templates for common communications — welcome emails, follow-up messages, showing confirmations, offer letters, etc. Templates can be used when sending emails to contacts or leads.

### How do I add a new template?
1. Navigate to **Email Template** in the sidebar.
2. Click **+ Add New**.
3. Enter a template name, description, and compose the email content using the editor.
4. Click **Save**.

### What fields are available?

| Field | Description |
|---|---|
| Template Name | Short identifying name for the template |
| Description | Brief summary of when to use this template |
| Email Body | Full HTML email content (supports a drag-and-drop design editor) |

### How do I use a template to send an email?
Open a Contact or Lead detail page, navigate to the Emails section, click **Send Email**, and select a template from the template picker.

### Sample record
- **Welcome Email** — "Welcome new clients to our real estate services" — HTML greeting introducing services

---

## 11. Common Workflows

### Workflow: New lead comes in
1. Add a **Lead** record with the prospect's name, email, phone, and address.
2. Set Lead Status to **New**.
3. Create a **Task** — "Initial follow-up call" with a due date within 24 hours.
4. Log the follow-up call in **Phone Calls** once completed.
5. Schedule a **Meeting** for a property consultation.
6. When the lead is ready to transact, create an **Opportunity** linked to the property.

### Workflow: Property listing to sale
1. Add a **Property** record with full details and listing price.
2. Add any seller as a **Contact**, linked in the property's Sellers field.
3. Create an **Opportunity** named after the property with the listing price as Opportunity Amount.
4. As the deal progresses, update the Opportunity **Sales Stage**.
5. Log **Meetings** and **Phone Calls** throughout the negotiation.
6. When closed, update the Opportunity stage to **Closed Won**.

### Workflow: Managing a corporate client
1. Create an **Account** for the company.
2. Add individual people at that company as **Contacts**, referencing the account.
3. Link **Opportunities** to that account.
4. Use **Email Templates** to send consistent communications to all contacts at the account.

---

## 12. Tips and Troubleshooting

### Q: Why are some records not appearing in the list?
Records are filtered by the logged-in user. Non-superAdmin users see only records they created or are assigned to. Ask your administrator to check record ownership if a record appears missing.

### Q: Why does the Opportunities or Accounts list show no records after I add one?
The list view uses a database pipeline that requires the `modifiedBy` field to be set. If you add a record via the form and it does not appear, edit the record once (click the three-dot menu, choose Edit, then Save without changes) to set the `modifiedBy` field and make it appear.

### Q: My phone number is being rejected on the Contact or Lead form.
Phone numbers must be all digits with no formatting characters. Enter `5125550101` not `512-555-0101`. The field accepts 10 to 12 digits.

### Q: How do I search for a record?
Use the **Search** bar at the top of any module list for a quick text search. Use **Advance Search** for multi-field filtering (date ranges, status, etc.).

### Q: Can I bulk-import records?
Yes. Most modules have an **Import** option accessible via the action menu or toolbar. Prepare a CSV file with the required column headers matching the field names and use the import dialog.

### Q: How do I delete a record?
Click the three-dot **Action** menu on the record's row and select **Delete**. Deletion is soft — the record is marked `deleted: true` in the database and hidden from list views, but not permanently removed.

### Q: Can I attach documents to a property?
Yes. On the Property add/edit form there is a **Property Documents** file upload field. Uploaded files are stored and accessible from the property detail view.

### Q: How do I assign a record to another team member?
On the add/edit form for Contacts, Leads, Opportunities, and Accounts, there is an **Assign User** field. Select the team member from the dropdown. They will then see the record in their filtered list view.

### Q: What does the calendar view show?
The Calendar page displays all **Tasks** with scheduled start dates as calendar events. Colors are determined by the Background Color field set on each task.

### Q: How do I send an email from the CRM?
Open a Contact or Lead detail page. In the Emails tab, click **Send Email**. You can compose a new message or pick from saved **Email Templates**.
