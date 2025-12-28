# Red Rose Symptom Checker Frontend

A Next.js 14+ TypeScript frontend application for the Red Rose Symptom Checker backend.

## Features

- Authentication with Auth.js (NextAuth replacement)
- Symptom diagnosis submission
- Diagnosis history viewing
- Protected routes
- Global state management with Zustand
- Server-side data fetching

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── diagnosis/         # Diagnosis pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── lib/                   # Utilities and API client
├── stores/                # Zustand stores
└── types/                 # TypeScript type definitions
```

