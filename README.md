# Jujitsu Video Analysis Frontend

This is the frontend application for the Jujitsu Video Analysis project. Built with React, TypeScript, and Vite, it provides a modern and responsive user interface for analyzing jujitsu videos.

## Prerequisites

Before you begin, ensure you have:

1. Node.js 18.0 or higher installed
2. npm or yarn package manager
3. Basic knowledge of React and TypeScript
4. Access to the backend API (see backend README for setup)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### 4. Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code linting

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Hooks
- **Routing**: React Router
- **HTTP Client**: Axios
- **Authentication**: Supabase

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API and external service integrations
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Root component
```

## Development Guidelines

1. **TypeScript**: Always use proper typing for props, state, and functions
2. **Components**: Follow atomic design principles
3. **Styling**: Use Tailwind CSS for styling
4. **State Management**: Use React hooks for local state
5. **Code Style**: Follow ESLint configuration

## Troubleshooting

### Common Issues:

1. **Module not found**: Ensure all dependencies are installed
2. **Type errors**: Check TypeScript configurations
3. **API connection**: Verify backend is running and environment variables are set
4. **Build errors**: Check for TypeScript compilation errors

### Getting Help

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure the backend server is running
4. Check the browser's developer tools for network errors

## Deployment

The application is configured for deployment on Vercel using the `vercel.json` configuration file.

## Contributing

1. Create a new branch for your feature
2. Follow the existing code style
3. Write meaningful commit messages
4. Submit a pull request

## Security Notes

- Never commit `.env` files
- Keep API keys and sensitive information secure
- Use environment variables for configuration
- Follow security best practices for authentication
