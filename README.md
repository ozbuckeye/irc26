# It's Raining Caches 2026 (IRC26)

A production-quality web application for the IRC26 geocaching initiative, built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

- **Public Landing Page**: Display headline stats, countdown timer, and information about IRC26
- **FAQ Page**: Comprehensive answers to common questions with synchronized statistics
- **Pledge System**: Allow geocachers to pledge their intent to hide caches with image uploads
- **Submission System**: Allow geocachers to submit confirmed published caches with GC codes
- **User Profile**: Logged-in users can view their pledges, submissions, and account information
- **Magic Link Authentication**: Secure email-based authentication for users (Rainmakers)
- **Admin Dashboard**: Protected admin area with detailed analytics, data management, and image gallery
- **Image Gallery**: Admin view of all uploaded images from pledges and submissions
- **CSV Exports**: Export pledges, submissions, and confirmations for analysis
- **Audit Logging**: Track all changes made through the admin dashboard

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for styling with custom fonts (`font-lovely`, `font-arial-rounded`)
- **Prisma ORM** for database management
- **PostgreSQL** for data storage
- **NextAuth** with EmailProvider for user authentication (magic links)
- **Custom JWT Admin Auth** for admin password protection
- **UploadThing** for image uploads
- **Zod** for validation
- **Jose** for JWT handling
- **Radix UI** for accessible components

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- UploadThing account (for image uploads)
- Environment variables configured (see Setup section)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/irc26?schema=public"

# NextAuth (for user magic link authentication)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Admin Authentication (custom JWT-based)
ADMIN_PASSWORD="change-me-in-production"

# UploadThing (for image uploads)
UPLOADTHING_TOKEN="your-uploadthing-token"
# OR (legacy support)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Email (for magic links)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@irc26.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="noreply@irc26.com"

# App URL (for magic links)
APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or create a migration
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── admin/        # Admin API endpoints (protected)
│   │   │   ├── audit/    # Audit log endpoints
│   │   │   ├── confirmations/  # Confirmation endpoints
│   │   │   ├── export/   # CSV export endpoints
│   │   │   ├── pledges/  # Pledge management
│   │   │   ├── stats/    # Admin statistics
│   │   │   ├── submissions/  # Submission management
│   │   │   └── verify/   # Admin password verification
│   │   ├── auth/         # NextAuth routes
│   │   ├── pledges/      # Public pledge endpoints
│   │   ├── submissions/  # Public submission endpoints
│   │   ├── stats/        # Public statistics
│   │   ├── uploadthing/  # Image upload endpoints
│   │   └── user/         # User profile endpoints
│   ├── admin/            # Admin dashboard pages
│   ├── auth/             # Authentication pages
│   │   ├── admin/        # Admin login (password-protected)
│   │   ├── signin/       # User sign-in (magic link)
│   │   └── verify-request/ # Magic link sent confirmation
│   ├── faqs/             # FAQ page
│   ├── pledge/           # Pledge pages
│   │   └── [id]/edit/    # Edit existing pledge
│   ├── profile/          # User profile page
│   ├── submission/       # Submission pages
│   │   └── [id]/edit/    # Edit existing submission
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── admin/           # Admin-specific components
│   │   ├── ImageGallery.tsx
│   │   ├── PledgeDetails.tsx
│   │   └── SubmissionDetails.tsx
│   ├── AdminDashboard.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── config/               # Configuration files
│   └── irc26.ts         # IRC26 event dates and constants
├── lib/                  # Utility libraries
│   ├── admin-session.ts  # Admin JWT session management
│   ├── admin-images.ts   # Admin image gallery helpers
│   ├── auth-config.ts    # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── session.ts        # User session helpers
│   ├── validation.ts     # Zod validation schemas
│   └── date-utils.ts     # Date formatting utilities
├── prisma/
│   └── schema.prisma    # Database schema
└── scripts/
    └── seed-admin.ts    # Admin user seeding script (optional)
```

## Key Configuration

Event dates are configured in `config/irc26.ts`:

- `RAIN_START_DATE`: When the official "It's Raining Caches" period starts (14 February 2026, 9:00 AM Sydney time)
- `SUBMISSION_DEADLINE`: Final date to submit caches (exactly 2 weeks before rain start)

These dates are used throughout the application for countdown timers and validation.

## Database Models

- **User**: Geocachers (Rainmakers) who pledge or submit caches
- **Pledge**: Intent to hide caches (with images, status, concept notes)
- **Submission**: Confirmed published caches with GC codes (images copied from pledge)
- **Session**: NextAuth user sessions
- **Account**: NextAuth account linking
- **AuditLog**: Admin action tracking
- **AdminUser**: Admin accounts (optional, currently using password-based auth)

## Authentication

### User Authentication (Rainmakers)
- Uses NextAuth with EmailProvider (magic links)
- Users sign in via `/auth/signin`
- Magic links sent via email
- Sessions stored in database via Prisma adapter

### Admin Authentication
- Custom JWT-based password protection
- Admin login at `/auth/admin`
- Password verified against `ADMIN_PASSWORD` environment variable
- Session stored in HTTP-only cookie (`admin-session`)

## API Endpoints

### Public Endpoints

- `GET /api/stats` - Public statistics (pledges, submissions, rainmakers, breakdowns)
- `POST /api/pledges` - Submit a new pledge
- `GET /api/pledges/[id]` - Get a specific pledge
- `POST /api/submissions` - Submit a new submission (requires associated pledge)
- `GET /api/submissions/[id]` - Get a specific submission

### User Endpoints (require NextAuth session)

- `GET /api/user/me` - Get current user profile
- `GET /api/pledges/me` - Get current user's pledges
- `GET /api/submissions/me` - Get current user's submissions

### Admin Endpoints (require admin session)

- `POST /api/admin/verify` - Verify admin password and create session
- `GET /api/admin/stats` - Detailed admin statistics
- `GET /api/admin/pledges` - List all pledges
- `GET /api/admin/submissions` - List all submissions
- `GET /api/admin/confirmations` - List all confirmations
- `GET /api/admin/audit` - Get audit logs
- `GET /api/admin/export/pledges` - Export pledges as CSV
- `GET /api/admin/export/submissions` - Export submissions as CSV
- `GET /api/admin/export/confirmations` - Export confirmations as CSV

## Image Uploads

- Uses UploadThing for image hosting
- Maximum 3 images per pledge/submission
- Maximum file size: 3MB per image
- Images stored as JSON in Prisma (`Json?` type)
- Images from pledges are automatically copied to associated submissions
- Admin image gallery displays all uploaded images

## Pages

- `/` - Landing page with stats and countdown
- `/faqs` - FAQ page with synchronized statistics
- `/pledge` - Create a new pledge
- `/pledge/[id]/edit` - Edit an existing pledge (requires authentication)
- `/submission/[id]/edit` - Edit an existing submission (requires authentication)
- `/profile` - User profile page (requires authentication)
- `/admin` - Admin dashboard (requires admin authentication)
- `/auth/signin` - User sign-in (magic link)
- `/auth/admin` - Admin login (password)

## Security Features

- Server-side validation on all API routes using Zod
- Admin routes protected with custom JWT sessions
- User routes protected with NextAuth sessions
- Users can only edit their own entries
- Images uploaded via secure UploadThing integration
- Audit logging for all admin actions
- Environment variables for sensitive data

## Development

### Database Studio

View and edit your database using Prisma Studio:

```bash
npm run db:studio
```

### Building for Production

```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run seed:admin` - Seed admin user (optional)

## Notes

- Submissions require an associated pledge
- Images uploaded to pledges are automatically copied to submissions
- The admin dashboard includes an image gallery showing all uploaded images
- Countdown timers display time until the rain start date
- Statistics are synchronized across the landing page and FAQ page
- Custom fonts (`font-lovely`, `font-arial-rounded`) are used throughout the UI

## License

This project is private and proprietary.
