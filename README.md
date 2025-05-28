# Jujitsu Training Tracker

A web application for tracking jujitsu training progress, managing belt levels, and generating curriculum based on student attendance.

## Project Structure

This repository contains both the frontend and backend of the Jujitsu Training Tracker application:

- Frontend: React + TypeScript application
- Backend: FastAPI application

## Features

- User authentication with email verification
- Profile management with belt levels
- Training session tracking
- Curriculum organized by belt level
- Intelligent class planner that generates curriculum based on active students
- Belt distribution analytics
- Video analysis for technique recognition

## Tech Stack

- Frontend:
  - React with TypeScript
  - Vite for building
  - Tailwind CSS for styling
  - Supabase for authentication and database
- Backend:
  - FastAPI
  - Python
  - OpenCV for video analysis

## Local Development Setup

### Prerequisites

1. Node.js (v16 or higher)
2. Python 3.8 or higher
3. A [Supabase](https://supabase.com) project

### Setup Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Pinaire1/jujitsu-app.git
   cd jujitsu-app
   ```

2. Set up the frontend:

   ```bash
   # Install dependencies
   npm install

   # Create .env file
   cp .env.example .env
   ```

3. Set up the backend:

   ```bash
   cd fastapi-backend

   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt
   ```

4. Configure environment variables:

   - Frontend (.env):
     ```
     VITE_SUPABASE_URL=your_supabase_url_here
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     VITE_APP_URL=http://localhost:5173
     ```
   - Backend (fastapi-backend/.env):
     ```
     SUPABASE_URL=your_supabase_url_here
     SUPABASE_KEY=your_supabase_service_role_key_here
     ```

5. Run the application:

   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend
   cd fastapi-backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   uvicorn main:app --reload
   ```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Database Setup

1. Create a new project in Supabase
2. Run the SQL script from `supabase_setup.sql` in your Supabase SQL Editor to create the necessary tables and sample data

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel project settings
3. Deploy your project

### Backend (Render)

The backend is configured for deployment on Render. The `render.yaml` file contains the necessary configuration.

## Project Structure

- `src/` - Frontend React application
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `lib/` - Utilities and shared code
- `fastapi-backend/` - Backend FastAPI application
  - `main.py` - Main application file
  - `analyze_video.py` - Video analysis functionality
  - `requirements.txt` - Python dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
