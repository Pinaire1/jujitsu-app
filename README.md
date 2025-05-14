# Jujitsu Training Tracker

A web application for tracking jujitsu training progress, managing belt levels, and generating curriculum based on student attendance.

## Features

- User authentication with email verification
- Profile management with belt levels
- Training session tracking
- Curriculum organized by belt level
- Intelligent class planner that generates curriculum based on active students
- Belt distribution analytics

## Tech Stack

- React with TypeScript
- Vite for building
- Tailwind CSS for styling
- Supabase for authentication and database

## Deployment Instructions for Vercel

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [Supabase](https://supabase.com) project

### Setup Environment Variables

Create a `.env` file from the example:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application Settings
VITE_APP_URL=https://your-app-domain.vercel.app
```

### Supabase Configuration for Email Verification

1. In your Supabase project, go to Authentication → Email Templates
2. Customize the "Confirm signup" template
3. Make sure the "Site URL" in Authentication settings is set to your Vercel deployment URL
4. Enable "Confirm email" in the Email Auth Provider settings

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL`
3. Deploy your project

### Database Setup

Run the SQL script from `supabase_setup.sql` in your Supabase SQL Editor to create the necessary tables and sample data.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Supabase credentials
4. Run the development server: `npm run dev`

## Testing Email Verification

To test email verification:

1. Register with a valid email
2. Check your inbox for the verification email
3. Click the verification link
4. You should be redirected to the app and be able to log in

For local development, you can use Supabase's email testing features in the dashboard.

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/lib/` - Utilities and shared code
- `src/components/ui/` - Base UI components
