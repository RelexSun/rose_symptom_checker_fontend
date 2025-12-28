# Project Structure

This document outlines the complete structure of the Red Rose Symptom Checker frontend application.

## Directory Structure

```
red-rose-symptom-checker-frontend/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth API route handler
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx          # Sign in page
│   │   └── signup/
│   │       └── page.tsx          # Sign up page
│   ├── diagnosis/
│   │   ├── check/
│   │   │   └── page.tsx          # Symptom check form page
│   │   └── history/
│   │       ├── [id]/
│   │       │   ├── page.tsx      # Diagnosis detail page
│   │       │   └── not-found.tsx # 404 page for diagnosis
│   │       └── page.tsx          # Diagnosis history list page
│   ├── globals.css               # Global styles with Tailwind
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Home page
├── components/                    # Reusable React components
│   ├── DiagnosisDetail.tsx       # Diagnosis detail view component
│   ├── DiagnosisForm.tsx         # Symptom submission form
│   ├── DiagnosisHistory.tsx      # Diagnosis history list component
│   ├── Layout.tsx                # Main layout with navigation
│   ├── LogoutButton.tsx          # Logout button component
│   └── Providers.tsx             # NextAuth SessionProvider wrapper
├── lib/                          # Utility libraries
│   ├── api.ts                    # Client-side API client (Axios)
│   ├── api-client.ts             # Client-side auth token helper
│   ├── api-server.ts             # Server-side API client
│   └── auth.ts                   # NextAuth configuration
├── stores/                       # Zustand state management
│   └── userStore.ts              # User state store
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Application types
│   └── next-auth.d.ts            # NextAuth type extensions
├── middleware.ts                 # Next.js middleware for route protection
├── .env.local.example            # Environment variables example
├── .gitignore                    # Git ignore file
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── README.md                      # Project documentation
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Key Features

### Authentication
- **NextAuth (Auth.js)**: Handles authentication with credentials provider
- **Zustand Store**: Manages user state globally
- **Protected Routes**: Middleware protects routes and redirects unauthenticated users

### API Integration
- **Centralized API Client**: Axios-based client with interceptors
- **Server-side Fetching**: Server components fetch data with session tokens
- **Client-side Fetching**: Client components use API client with token management
- **Error Handling**: Comprehensive error handling for API calls

### Pages
1. **Home (`/`)**: Welcome page with navigation to main features
2. **Sign In (`/auth/signin`)**: User authentication
3. **Sign Up (`/auth/signup`)**: User registration
4. **Check Symptoms (`/diagnosis/check`)**: Form to submit symptoms
5. **History (`/diagnosis/history`)**: List of past diagnoses
6. **Diagnosis Detail (`/diagnosis/history/[id]`)**: Detailed view of a diagnosis

### Components
- **Layout**: Main layout with navigation and footer
- **LogoutButton**: Handles user logout
- **DiagnosisForm**: Form for submitting symptoms
- **DiagnosisHistory**: Displays list of diagnoses
- **DiagnosisDetail**: Shows detailed diagnosis information

## Technology Stack

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **NextAuth v5 (beta)**: Authentication (Auth.js)
- **Zustand**: Global state management
- **Axios**: HTTP client for API calls
- **Tailwind CSS**: Utility-first CSS framework

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.local.example` to `.env.local` and configure
3. Run development server: `npm run dev`
4. Open http://localhost:3000

## API Endpoints Used

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/diagnosis/check` - Submit symptoms for diagnosis
- `GET /api/v1/diagnosis/history` - Get diagnosis history
- `GET /api/v1/diagnosis/history/{id}` - Get single diagnosis

