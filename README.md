# PUPay

PUPay is an AI-assisted payment collection and tracking system designed for student collections. It helps class treasurers or administrators manage student records, create collections, monitor payments, send announcements, notify students, and generate AI-assisted reminders and summaries.

The system includes separate portals for Admin/Treasurer users and Student users, with role-based access control powered by Clerk authentication.

---

## Project Overview

PUPay was developed to make student payment collection easier, more transparent, and more organized. Instead of manually tracking collections, payments, reminders, and announcements, the system provides a centralized platform where admins can manage collection records and students can view their assigned collections, payment history, notifications, and receipts.

---

## Main Features

### Admin/Treasurer Features

* Admin dashboard with payment and collection overview
* Student management
* Excel import for student records
* Collection creation with target audience selection
* Automatic payment record generation
* Collection progress tracking
* Admin collection details page
* Payment monitoring
* Manual payment status updates
* Announcement management
* AI Helper for generating:

  * Payment reminders
  * Collection summaries
  * Announcement drafts
* Use AI-generated text as announcement draft
* Automatic student notifications when collections are created
* Optional Gmail email notifications for announcements
* Archives for collections and announcements
* Printable collection reports
* Light and dark mode support

### Student Features

* Student dashboard
* View assigned collections
* Payment History page
* Pay online through PayMongo checkout
* View announcements
* View notifications
* Notification bell with unread count
* Announcement details modal
* Printable payment receipts
* Student profile page
* Light and dark mode support

### System Features

* Clerk authentication
* Role-based route protection
* Student ownership protection
* MySQL database integration
* PayMongo checkout integration
* PayMongo webhook payment confirmation
* Gemini AI integration
* AI fallback behavior when Gemini is unavailable
* Gmail/Nodemailer email notification support
* Responsive dashboard layout
* Vercel and Railway deployment support

---

## Technology Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Clerk React
* CSS Modules / custom CSS
* Lucide React icons

### Backend

* Node.js
* Express.js
* MySQL2
* Clerk Express
* Multer
* ExcelJS
* PayMongo API
* Google Gemini API
* Nodemailer

### Database

* MySQL

### Authentication

* Clerk Authentication

### Payment Integration

* PayMongo Checkout
* PayMongo Webhook

### AI Integration

* Google Gemini API

### Email Integration

* Nodemailer
* Gmail SMTP with Gmail App Password

### Deployment

* Vercel for frontend
* Railway for backend and MySQL database

---

## Environment Variables

### Frontend Environment Variables

Create a `.env` file inside the `client` folder.

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### Backend Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pupay

CLERK_SECRET_KEY=your_clerk_secret_key
CLIENT_URL=http://localhost:5173

PAYMONGO_SECRET_KEY=your_paymongo_secret_key
PAYMONGO_WEBHOOK_SECRET=your_paymongo_webhook_secret

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite

EMAIL_NOTIFICATIONS_ENABLED=false
GMAIL_USER=
GMAIL_APP_PASSWORD=
EMAIL_FROM_NAME=PUPay
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/PUPay-Final.git
cd PUPay-Final
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will run at:

```txt
http://localhost:5173
```

---

## Backend Setup

```bash
cd server
npm install
npm run dev
```

The backend will run at:

```txt
http://localhost:5000
```

---

## Database Setup

1. Create a MySQL database named `pupay`.
2. Open `server/src/database/schema.sql`.
3. Run the SQL script in MySQL Workbench, DBeaver, or another MySQL client.
4. Make sure the backend `.env` database credentials match your MySQL setup.

---

## Clerk Setup

PUPay uses Clerk for authentication and role-based access.

Admin users should have Clerk private metadata similar to:

```json
{
  "role": "admin"
}
```

or:

```json
{
  "role": "treasurer"
}
```

Student users are matched to student records using their registered email address.

---

## PayMongo Setup

PUPay uses PayMongo for student online payments.

Required backend variables:

```env
PAYMONGO_SECRET_KEY=your_paymongo_secret_key
PAYMONGO_WEBHOOK_SECRET=your_paymongo_webhook_secret
```

Webhook URL format:

```txt
https://your-backend-domain/api/payments/paymongo/webhook
```

For local development, use a tunneling tool such as ngrok if webhook testing is needed.

---

## Gemini AI Setup

PUPay uses Gemini AI for the Admin AI Helper.

Required backend variables:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
```

If the Gemini API key is missing or the request fails, the system returns fallback generated text so the AI Helper can still function.

---

## Gmail Email Notification Setup

PUPay supports optional Gmail email notifications using Nodemailer.

Required backend variables:

```env
EMAIL_NOTIFICATIONS_ENABLED=true
GMAIL_USER=your_sender_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
EMAIL_FROM_NAME=PUPay
```

The Gmail App Password must be generated from a Google account with 2-Step Verification enabled.

Email notifications are optional. If email sending fails, the announcement or collection creation process will still continue.

---

## Main User Flow

### Admin/Treasurer Flow

1. Admin logs in.
2. Admin imports or adds student records.
3. Admin creates a collection.
4. System automatically generates payment records.
5. System notifies matching students.
6. Admin monitors payment progress.
7. Admin creates announcements or uses AI Helper to generate reminders.
8. Admin archives completed records if needed.

### Student Flow

1. Student logs in.
2. Student views assigned collections.
3. Student pays online through PayMongo.
4. Student views payment history.
5. Student reads announcements and notifications.
6. Student prints payment receipts if needed.

---

## Security Features

* Clerk authentication
* Role-based frontend route protection
* Backend middleware protection
* Admin-only routes
* Student-only routes
* Student ownership validation
* Environment variables for secrets
* PayMongo webhook signature verification
* Backend-only Gmail credentials
* Backend-only Gemini API key
* Protected AI routes

---

## Known Notes

* Gmail email notifications depend on valid Gmail App Password credentials.
* Gmail sending may be subject to Google account limits.
* Email notification failure does not block announcement or collection creation.
* Vite may show a chunk-size warning during build; this is not a deployment blocker.
* Some npm audit warnings may come from existing dependencies and should not be force-fixed without testing.

---

## Final Testing Checklist

Before deployment or defense, test:

* Admin login
* Student login
* Student import
* Collection creation
* Automatic payment record generation
* Student My Collections
* Payment History
* PayMongo checkout
* PayMongo webhook confirmation
* Manual announcement creation
* Collection-created notification
* Student unread bell count
* Gmail email notification
* AI Reminder Generator
* AI Collection Summary
* AI Announcement Generator
* Use AI Output as Announcement
* Printable student receipts
* Printable admin collection reports
* Archive and restore
* Unauthorized page
* 404 page
* Light and dark mode
* Mobile responsiveness