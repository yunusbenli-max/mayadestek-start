# MayaDestek Start

A Next.js application for MayaDestek onboarding process.

## Local Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
MAYADESTEK_API_KEY=your_api_key_here
MAYADESTEK_API_BASE=https://mayadestek-api-355l5o2k7q-uc.a.run.app
```

Note: `MAYADESTEK_API_BASE` is optional and defaults to the URL above if not provided.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Vercel Deployment

### Environment Variables

In your Vercel project settings, add the following environment variables:

1. **MAYADESTEK_API_KEY** (Required)
   - Your MayaDestek API key
   - Keep this secret, never commit it to the repository

2. **MAYADESTEK_API_BASE** (Optional)
   - Default: `https://mayadestek-api-355l5o2k7q-uc.a.run.app`
   - Only set if you need to use a different API endpoint

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).

2. Import your project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - **Important**: Leave "Root Directory" empty (deploy from repo root)

3. Add environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add `MAYADESTEK_API_KEY` (Required)
   - Optionally add `MAYADESTEK_API_BASE` if needed

4. Deploy:
   - Vercel will automatically detect Next.js and build your project
   - The build command is: `npm run build`
   - Output directory: `.next` (handled automatically)

### Verifying Deployment

1. After deployment, visit your Vercel URL
2. Fill out the onboarding form:
   - Student Name
   - Parent Phone
   - Student Phone
3. Submit the form
4. You should be redirected to the MayaDestek onboarding page

### Troubleshooting

- **404 errors**: Ensure Root Directory is empty in Vercel settings
- **API errors**: Verify `MAYADESTEK_API_KEY` is set correctly in Vercel environment variables
- **Build failures**: Run `npm run build` locally to check for TypeScript or build errors

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── onboarding/
│   │       └── start/
│   │           └── route.ts       # Server-side API proxy
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page with form
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

env redeploy Sat Jan 10 05:36:28 +03 2026
