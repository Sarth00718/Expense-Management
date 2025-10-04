# Exe$Man System Workflows

This document provides visual representations of common workflows in the Exe$Man expense management system.

## Table of Contents

1. [User Roles Overview](#user-roles-overview)
2. [Expense Submission Flow](#expense-submission-flow)
3. [Approval Process](#approval-process)
4. [User Management Flow](#user-management-flow)
5. [Multi-Currency Handling](#multi-currency-handling)
6. [Analytics and Reporting](#analytics-and-reporting)

---

## User Roles Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     ROLE HIERARCHY                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌──────────────┐                         │
│                    │    ADMIN     │                         │
│                    │              │                         │
│                    │ • Full Access│                         │
│                    │ • Override   │                         │
│                    │ • Configure  │                         │
│                    └──────┬───────┘                         │
│                           │                                 │
│                           │ manages                         │
│                           ▼                                 │
│                    ┌──────────────┐                         │
│                    │   MANAGER    │                         │
│                    │              │                         │
│                    │ • Approve    │                         │
│                    │ • Team View  │                         │
│                    │ • Analytics  │                         │
│                    └──────┬───────┘                         │
│                           │                                 │
│                           │ approves                        │
│                           ▼                                 │
│                    ┌──────────────┐                         │
│                    │   EMPLOYEE   │                         │
│                    │              │                         │
│                    │ • Submit     │                         │
│                    │ • Upload     │                         │
│                    │ • Track      │                         │
│                    └──────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Expense Submission Flow

### Standard Expense Submission

```
┌─────────────────────────────────────────────────────────────┐
│              EMPLOYEE EXPENSE SUBMISSION                    │
└─────────────────────────────────────────────────────────────┘

    Employee                    System                  Manager
       │                          │                        │
       │  1. Login                │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │  2. Navigate to Expenses │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │  3. Click "New Expense"  │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │  4. Fill in details      │                        │
       │     • Amount             │                        │
       │     • Currency           │                        │
       │     • Category           │                        │
       │     • Description        │                        │
       │     • Date               │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │  5. Upload receipt       │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │                          │  6. OCR Processing     │
       │                          │     • Extract amount   │
       │                          │     • Extract date     │
       │                          │     • Extract vendor   │
       │                          │     • Suggest category │
       │                          │                        │
       │  7. Review OCR data      │                        │
       │<─────────────────────────┤                        │
       │                          │                        │
       │  8. Correct if needed    │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │  9. Submit for approval  │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │                          │  10. Save to DB        │
       │                          │      Status: PENDING   │
       │                          │                        │
       │                          │  11. Send notification │
       │                          ├───────────────────────>│
       │                          │                        │
       │  12. Confirmation        │                        │
       │<─────────────────────────┤                        │
       │                          │                        │
       │  13. View in history     │                        │
       │     Status: PENDING      │                        │
       │                          │                        │
```

### Expense with Receipt OCR

```
┌─────────────────────────────────────────────────────────────┐
│                  OCR PROCESSING FLOW                        │
└─────────────────────────────────────────────────────────────┘

    Employee                    System                  OCR Engine
       │                          │                        │
       │  1. Upload receipt image │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │                          │  2. Validate file      │
       │                          │     • Check format     │
       │                          │     • Check size       │
       │                          │                        │
       │                          │  3. Send to OCR        │
       │                          ├───────────────────────>│
       │                          │                        │
       │                          │                        │  4. Process image
       │                          │                        │     • Text extraction
       │                          │                        │     • Pattern matching
       │                          │                        │     • Data parsing
       │                          │                        │
       │                          │  5. Return data        │
       │                          │<───────────────────────┤
       │                          │     {                  │
       │                          │       amount: 50.00    │
       │                          │       date: 2024-10-01 │
       │                          │       vendor: "Store"  │
       │                          │       category: "food" │
       │                          │     }                  │
       │                          │                        │
       │  6. Display extracted    │                        │
       │     data in form         │                        │
       │<─────────────────────────┤                        │
       │                          │                        │
       │  7. Review & edit        │                        │
       │     if needed            │                        │
       │                          │                        │
```

---

## Approval Process

### Manager Approval Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  APPROVAL WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

    Employee            System              Manager            Admin
       │                  │                    │                 │
       │  Expense         │                    │                 │
       │  Submitted       │                    │                 │
       │  (PENDING)       │                    │                 │
       ├─────────────────>│                    │                 │
       │                  │                    │                 │
       │                  │  Notification      │                 │
       │                  ├───────────────────>│                 │
       │                  │                    │                 │
       │                  │                    │  Review         │
       │                  │                    │  Expense        │
       │                  │                    │                 │
       │                  │                    │                 │
       │                  │                    ├─ Decision ─────┐
       │                  │                    │                 │
       │                  │                    │                 │
       │                  │  ┌─────────────────┴──────┐          │
       │                  │  │                        │          │
       │                  │  ▼                        ▼          │
       │                  │ APPROVE                REJECT        │
       │                  │  │                        │          │
       │                  │  │                        │          │
       │  Notification    │  │                        │          │
       │  (APPROVED)      │  │                        │          │
       │<─────────────────┤  │                        │          │
       │                  │  │                        │          │
       │                  │  │                        │          │
       │  Notification    │  │                        │          │
       │  (REJECTED)      │  │                        │          │
       │<─────────────────┤  │                        │          │
       │  + Comment       │  │                        │          │
       │                  │  │                        │          │
       │                  │  │                        │          │
       │  Can resubmit    │  │                        │          │
       │  new expense     │  │                        │          │
       │                  │  │                        │          │
       │                  │  │                        │          │
       │                  │  │  If amount > threshold │          │
       │                  │  │  Escalate to Admin     │          │
       │                  │  ├───────────────────────────────────>│
       │                  │  │                        │          │
       │                  │  │                        │  Admin   │
       │                  │  │                        │  Reviews │
       │                  │  │                        │          │
       │                  │  │  Final Decision        │          │
       │                  │  │<───────────────────────────────────┤
       │                  │  │                        │          │
```

### Admin Override

```
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN OVERRIDE FLOW                        │
└─────────────────────────────────────────────────────────────┘

    Employee            System              Manager            Admin
       │                  │                    │                 │
       │  Expense         │                    │                 │
       │  (PENDING)       │                    │                 │
       │                  │                    │                 │
       │                  │                    │  Admin views    │
       │                  │                    │  any expense    │
       │                  │                    │<────────────────┤
       │                  │                    │                 │
       │                  │                    │  Click          │
       │                  │                    │  "Override"     │
       │                  │                    │                 │
       │                  │  Immediate approval│                 │
       │                  │  Bypass normal flow│                 │
       │                  │<───────────────────────────────────────┤
       │                  │                    │                 │
       │  Notification    │                    │                 │
       │  (APPROVED)      │                    │                 │
       │<─────────────────┤                    │                 │
       │  "Admin Override"│                    │                 │
       │                  │                    │                 │
```

---

## User Management Flow

### Admin Creates New User

```
┌─────────────────────────────────────────────────────────────┐
│              USER CREATION WORKFLOW                         │
└─────────────────────────────────────────────────────────────┘

    Admin                       System                  New User
       │                          │                        │
       │  1. Navigate to Users    │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │  2. Click "Add User"     │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │  3. Fill in details:     │                        │
       │     • Email              │                        │
       │     • Password           │                        │
       │     • Name               │                        │
       │     • Role               │                        │
       │     • Manager (if emp)   │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │                          │  4. Validate data      │
       │                          │     • Check email      │
       │                          │     • Hash password    │
       │                          │     • Verify manager   │
       │                          │                        │
       │                          │  5. Create in DB       │
       │                          │                        │
       │  6. Confirmation         │                        │
       │<─────────────────────────┤                        │
       │                          │                        │
       │  7. Share credentials    │                        │
       │     (manually)           │                        │
       ├──────────────────────────────────────────────────>│
       │                          │                        │
       │                          │                        │  8. First login
       │                          │                        │     with provided
       │                          │                        │     credentials
       │                          │<───────────────────────┤
       │                          │                        │
```

### Organizational Structure

```
┌─────────────────────────────────────────────────────────────┐
│              COMPANY HIERARCHY SETUP                        │
└─────────────────────────────────────────────────────────────┘

                    Company: Acme Corp
                            │
                            │
                    ┌───────┴────────┐
                    │     ADMIN      │
                    │  admin@co.com  │
                    └───────┬────────┘
                            │
                            │ creates & manages
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  ┌──────────┐        ┌──────────┐       ┌──────────┐
  │ MANAGER  │        │ MANAGER  │       │ MANAGER  │
  │  Sales   │        │   IT     │       │   HR     │
  └────┬─────┘        └────┬─────┘       └────┬─────┘
       │                   │                   │
       │ approves          │ approves          │ approves
       │                   │                   │
  ┌────┴─────┐        ┌────┴─────┐       ┌────┴─────┐
  │          │        │          │       │          │
  ▼          ▼        ▼          ▼       ▼          ▼
┌────┐    ┌────┐   ┌────┐    ┌────┐  ┌────┐    ┌────┐
│Emp1│    │Emp2│   │Emp3│    │Emp4│  │Emp5│    │Emp6│
└────┘    └────┘   └────┘    └────┘  └────┘    └────┘

Each employee submits expenses → Manager approves → Admin oversees
```

---

## Multi-Currency Handling

### Currency Conversion Flow

```
┌─────────────────────────────────────────────────────────────┐
│            MULTI-CURRENCY EXPENSE FLOW                      │
└─────────────────────────────────────────────────────────────┘

    Employee            System              Currency API      Manager
       │                  │                      │              │
       │  1. Create       │                      │              │
       │     expense      │                      │              │
       │     Amount: 100  │                      │              │
       │     Currency: EUR│                      │              │
       ├─────────────────>│                      │              │
       │                  │                      │              │
       │                  │  2. Check if         │              │
       │                  │     conversion       │              │
       │                  │     needed           │              │
       │                  │                      │              │
       │                  │  3. Get exchange     │              │
       │                  │     rate             │              │
       │                  ├─────────────────────>│              │
       │                  │                      │              │
       │                  │  4. Return rate      │              │
       │                  │     EUR/USD = 1.10   │              │
       │                  │<─────────────────────┤              │
       │                  │                      │              │
       │                  │  5. Calculate        │              │
       │                  │     100 EUR =        │              │
       │                  │     110 USD          │              │
       │                  │                      │              │
       │  6. Show both    │                      │              │
       │     amounts:     │                      │              │
       │     €100 (EUR)   │                      │              │
       │     $110 (USD)   │                      │              │
       │<─────────────────┤                      │              │
       │                  │                      │              │
       │  7. Submit       │                      │              │
       ├─────────────────>│                      │              │
       │                  │                      │              │
       │                  │  8. Store both       │              │
       │                  │     amounts in DB    │              │
       │                  │                      │              │
       │                  │  9. Notify manager   │              │
       │                  │     Show both        │              │
       │                  │     currencies       │              │
       │                  ├─────────────────────────────────────>│
       │                  │                      │              │
       │                  │                      │  Manager sees:
       │                  │                      │  Original: €100
       │                  │                      │  Company: $110
       │                  │                      │              │
```

---

## Analytics and Reporting

### Report Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│              ANALYTICS & REPORTING FLOW                     │
└─────────────────────────────────────────────────────────────┘

    User (Manager/Admin)        System                  Database
       │                          │                        │
       │  1. Navigate to          │                        │
       │     Analytics            │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │                          │  2. Query expenses     │
       │                          ├───────────────────────>│
       │                          │     • Filter by date   │
       │                          │     • Filter by user   │
       │                          │     • Filter by status │
       │                          │                        │
       │                          │  3. Return data        │
       │                          │<───────────────────────┤
       │                          │                        │
       │                          │  4. Calculate stats    │
       │                          │     • Total amount     │
       │                          │     • By category      │
       │                          │     • By month         │
       │                          │     • Approval rate    │
       │                          │                        │
       │  5. Display dashboard    │                        │
       │<─────────────────────────┤                        │
       │     • Charts             │                        │
       │     • Tables             │                        │
       │     • Metrics            │                        │
       │                          │                        │
       │  6. Click "Export"       │                        │
       ├─────────────────────────>│                        │
       │                          │                        │
       │                          │  7. Generate report    │
       │                          │     • PDF or Excel     │
       │                          │     • Format data      │
       │                          │     • Add charts       │
       │                          │                        │
       │  8. Download file        │                        │
       │<─────────────────────────┤                        │
       │                          │                        │
```

### Dashboard Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  DASHBOARD METRICS                          │
└─────────────────────────────────────────────────────────────┘

                        User Logs In
                             │
                             ▼
                    ┌────────────────┐
                    │   Dashboard    │
                    │   Loads        │
                    └────────┬───────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │  Total   │  │ Pending  │  │ Approved │
         │ Expenses │  │ Expenses │  │ Expenses │
         └──────────┘  └──────────┘  └──────────┘
                │            │            │
                └────────────┼────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Aggregate     │
                    │  & Display     │
                    └────────┬───────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ Category │  │ Monthly  │  │ Approval │
         │ Breakdown│  │  Trends  │  │  Stats   │
         └──────────┘  └──────────┘  └──────────┘
```

---

## Complete System Flow

### End-to-End Expense Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│           COMPLETE EXPENSE LIFECYCLE                        │
└─────────────────────────────────────────────────────────────┘

1. CREATION
   Employee creates expense
   Status: DRAFT
   │
   ▼
2. SUBMISSION
   Employee submits for approval
   Status: PENDING
   │
   ▼
3. NOTIFICATION
   Manager receives notification
   │
   ▼
4. REVIEW
   Manager reviews expense
   │
   ├─────────────┬─────────────┐
   │             │             │
   ▼             ▼             ▼
APPROVE      REJECT      ESCALATE
   │             │             │
   │             │             ▼
   │             │         Admin Review
   │             │             │
   │             │             ▼
   │             │         Admin Decision
   │             │
   ▼             ▼
Status:       Status:
APPROVED      REJECTED
   │             │
   │             ▼
   │         Employee
   │         Resubmits
   │             │
   │             ▼
   │         New Expense
   │
   ▼
5. NOTIFICATION
   Employee notified
   │
   ▼
6. ANALYTICS
   Expense included in reports
   │
   ▼
7. EXPORT
   Included in monthly report
   │
   ▼
8. ARCHIVE
   Stored for records
```

---

## State Diagram

### Expense Status States

```
┌─────────────────────────────────────────────────────────────┐
│              EXPENSE STATUS STATE MACHINE                   │
└─────────────────────────────────────────────────────────────┘

                    [START]
                       │
                       ▼
                  ┌────────┐
                  │ DRAFT  │◄──────────┐
                  └───┬────┘           │
                      │                │
                      │ submit         │ save
                      │                │
                      ▼                │
                  ┌─────────┐          │
            ┌────►│ PENDING │          │
            │     └────┬────┘          │
            │          │               │
            │          │ review        │
            │          │               │
            │     ┌────┴────┐          │
            │     │         │          │
            │     ▼         ▼          │
            │ ┌────────┐ ┌────────┐   │
            │ │APPROVED│ │REJECTED│───┘
            │ └────────┘ └───┬────┘
            │                 │
            │                 │ resubmit
            │                 │ (new expense)
            └─────────────────┘

States:
• DRAFT: Editable by employee
• PENDING: Awaiting approval
• APPROVED: Approved by manager/admin
• REJECTED: Rejected with comments

Transitions:
• submit: DRAFT → PENDING
• approve: PENDING → APPROVED
• reject: PENDING → REJECTED
• resubmit: REJECTED → new DRAFT
• save: any → DRAFT
• override: any → APPROVED (admin only)
```

---

## Integration Points

### System Integration Overview

```
┌─────────────────────────────────────────────────────────────┐
│              SYSTEM INTEGRATION MAP                         │
└─────────────────────────────────────────────────────────────┘

    Frontend (React)          Backend (Express)        External
         │                          │                     │
         │                          │                     │
         │  HTTP/REST API           │                     │
         ├─────────────────────────>│                     │
         │  /api/expenses           │                     │
         │  /api/approvals          │                     │
         │  /api/users              │                     │
         │  /api/analytics          │                     │
         │                          │                     │
         │                          │  MongoDB            │
         │                          ├────────────────────>│
         │                          │  Store data         │
         │                          │                     │
         │                          │  Currency API       │
         │                          ├────────────────────>│
         │                          │  Exchange rates     │
         │                          │                     │
         │  WebSocket (Socket.io)   │                     │
         │<─────────────────────────┤                     │
         │  Real-time notifications │                     │
         │                          │                     │
         │                          │  OCR Service        │
         │                          ├────────────────────>│
         │                          │  (Tesseract.js)     │
         │                          │  Receipt processing │
         │                          │                     │
```

---

**This document provides visual workflows for the Exe$Man system.**
**For detailed instructions, see USER_GUIDE.md**
**For quick testing, see QUICK_START.md**
