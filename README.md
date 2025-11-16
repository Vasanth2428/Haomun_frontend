# HaoMun Frontend

The frontend component of the HaoMun project - "The Intelligence Pavilion" where ancient wisdom meets modern intelligence.

## Overview

This is the React/Next.js frontend application that provides the user interface for HaoMun's intelligence analysis platform. It serves as the client-side interface for interacting with backend services that analyze competitive programming performance across multiple platforms.

## Tech Stack

- **Framework**: Next.js 16.0.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **Theme**: next-themes for dark/light mode

## Features

- 📊 **Intelligence Pavilion**: Real-time coding platform analysis
- ⚔️ **Contrast Hall**: Compare users across platforms  
- 📚 **Archive Chamber**: Historical data visualization
- 🛠️ **Scroll Forge**: AI-powered content generation
- 🎨 **Modern UI**: Responsive design with theme support
- 📈 **Analytics**: Interactive charts and insights

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HaoMun_1
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure the following environment variable in `.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                   # Utility functions
├── public/                # Static assets
├── styles/                # Global CSS styles
├── utils/                 # API utilities and helpers
├── .env.local             # Environment variables
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── next.config.mjs       # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # This file
```

## Key Components

### Pages
- `app/page.tsx` - Main landing page
- `app/layout.tsx` - Root layout component

### Core Components
- `components/navbar.tsx` - Navigation component
- `components/insight-pavilion.tsx` - Platform analysis interface
- `components/contrast-hall.tsx` - User comparison interface
- `components/archive-chamber.tsx` - Historical data viewer
- `components/scroll-forge.tsx` - AI content generation

### Utilities
- `utils/api.ts` - API communication with backend
- `lib/utils.ts` - General utility functions

## API Integration

The frontend communicates with the HaoMun backend through REST API endpoints defined in `utils/api.ts`:

- `/api/summary/generate` - Generate insights from user stats
- `/api/compare` - Compare multiple users
- `/api/scrollforge/edit` - AI-powered content editing
- `/api/report/create` - Generate PDF reports

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL | `http://localhost:5000` |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

## Deployment

### Vercel (Recommended)

1. Push to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The built application in the `out/` directory can be deployed to any static hosting service.

## Contributing

1. Follow the existing code style and TypeScript conventions
2. Ensure all components are responsive and accessible
3. Test on both light and dark themes
4. Update documentation as needed

## License

This project is part of the HaoMun intelligence analysis platform.