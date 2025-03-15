# Event Management App

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository to your local machine
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_URL=your_project_url
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run preview` - Preview the production build locally