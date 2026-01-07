# MayaDestek Onboarding Website

A secure **Next.js (App Router)** onboarding website for MayaDestek, deployable to Vercel with **server-side API key protection**.

## Features

- Hero section with call-to-action
- Onboarding form with validation
- Server-side API route handler (API key never exposed to client)
- Grade selection (G5-G12, default G8)
- Success state with auto-redirect to backend
- Error handling with user-friendly messages

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Plain CSS (no UI libraries)
- Server-side API routes for secure backend communication

## Environment Variables

### Required for Vercel Deployment

The following environment variables must be set in your Vercel project settings:

1. **`MAYADESTEK_API_KEY`** (Required)
   - Your backend API key
   - **Never expose this in client-side code** - it's only used in server-side API routes
   - Set this in Vercel: Project Settings → Environment Variables

2. **`MAYADESTEK_API_BASE`** (Optional)
   - Backend API base URL
   - Example: `https://mayadestek-api-355l5o2k7q-uc.a.run.app`
   - Used by the server-side API route handler
   - If not set, the app defaults to the backend base above

### Local Development

Create a `.env.local` file in the root directory:

```env
MAYADESTEK_API_KEY=your_api_key_here
MAYADESTEK_API_BASE=https://mayadestek-api-355l5o2k7q-uc.a.run.app
```

**Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env.local` file in the root directory with the environment variables listed above.

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Select the repository containing this project

### Step 2: Configure Project

1. **Framework Preset:** Next.js (should be auto-detected)
2. **Root Directory:** `./` (IMPORTANT)
3. **Build Command:** `npm run build` (default)
4. **Output Directory:** `.next` (default)

**Important:** This repo previously contained multiple Next.js projects (nested folders and duplicate `app/` trees). It is now consolidated so Vercel must point to the repository root (`./`) to avoid `404 NOT_FOUND` from building the wrong directory.

### Step 3: Set Environment Variables

In the Vercel project settings (Settings → Environment Variables), add:

- `MAYADESTEK_API_KEY` = `YOUR_ACTUAL_API_KEY` (Required)
- `MAYADESTEK_API_BASE` = `https://mayadestek-api-355l5o2k7q-uc.a.run.app` (Optional)

**Security Note:** `MAYADESTEK_API_KEY` is a server-side variable (no `NEXT_PUBLIC_` prefix), so it will never be exposed to the browser.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be live at `https://your-project.vercel.app`

### Step 5: Verify Deployment

1. Visit your deployed URL
2. Test the onboarding form
3. Verify that the API key is not exposed in browser DevTools → Network tab

## Project Structure

```
mayadestek-start/
├── app/
│   ├── api/
│   │   └── onboarding/
│   │       └── start/
│   │           └── route.ts         # Server-side onboarding proxy (API key stays server-side)
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing + onboarding form (client component)
│   └── globals.css                  # Global styles
├── .env.local                       # Local environment variables (not in git)
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## API Integration

### Architecture

The app uses a secure two-layer architecture:

1. **Client-side (`app/page.tsx`)**: Makes requests to Next.js API route
2. **Server-side (`app/api/onboarding/start/route.ts`)**: Handles backend communication with API key

This ensures the API key is never exposed to the browser.

### API Route

**Endpoint:** `POST /api/onboarding/start`

**Request Body:**
```json
{
  "parent_name": "string (required)",
  "student_name": "string (required)",
  "grade_code": "G5-G12 (required)",
  "student_phone": "string (optional)",
  "goal": "string (optional)"
}
```

**Response:**
- Success (200): Returns backend response as-is
- Error (400/500): Returns `{ error: "message" }`

### Backend Integration

The API route handler calls:
- **Backend URL:** `${MAYADESTEK_API_BASE}/public/onboarding/start`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: ${MAYADESTEK_API_KEY}`

### Backend Response

```json
{
  "student_code": "string",
  "student_id": "string",
  "parent_id": "string",
  "grade_code": "string",
  "token": "string | null"
}
```

After successful onboarding, users are automatically redirected to:
`https://mayadestek-api-355l5o2k7q-uc.a.run.app/start?sc={student_code}`

## Security

- ✅ API key is stored server-side only (`MAYADESTEK_API_KEY`)
- ✅ API key is never exposed in client-side code
- ✅ All backend requests go through Next.js API route handler
- ✅ Client only communicates with same-origin API routes

## Troubleshooting

### Build Errors

- Ensure Node.js 18+ is installed
- Delete `node_modules` and `.next` folders, then run `npm install` again
- Check that all required environment variables are set correctly

### API Connection Issues

- Verify `MAYADESTEK_API_BASE` is correct in Vercel environment variables
- Verify `MAYADESTEK_API_KEY` is valid in Vercel environment variables
- Check Vercel function logs for server-side errors
- Check browser console for client-side error messages

### Missing Environment Variables

If you see "Server configuration error" messages:
- Ensure `MAYADESTEK_API_KEY` is set in Vercel
- Ensure `MAYADESTEK_API_BASE` is set in Vercel
- Redeploy after adding environment variables

## License

Private project for MayaDestek.
