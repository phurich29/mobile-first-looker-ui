# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mobile-first rice quality monitoring and analysis application built with React, TypeScript, and Capacitor. The application provides real-time monitoring of rice quality measurements from IoT devices, with support for both web and mobile platforms.

## Common Development Commands

### Development
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build with development mode
- `npm run build:production` - Build for production mode
- `npm run build:deploy` - Run production build script
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Mobile Development (Capacitor)
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run build:android` - Build and open Android project
- `npm run build:ios` - Build and open iOS project
- `npm run sync` - Sync web assets to native platforms
- `npm run sync:android` - Sync Android platform
- `npm run sync:ios` - Sync iOS platform

## Code Architecture

### Core Stack
- **Frontend Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: React Router v6
- **Mobile**: Capacitor for cross-platform mobile support
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── auth/            # Authentication components
│   ├── device-management/   # Device management features
│   ├── graph-monitor/   # Real-time graph monitoring
│   └── database-table/  # Database table components
├── contexts/            # React contexts (Auth, Language, Countdown)
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions and helpers
│   ├── utils.ts        # General utilities
│   └── translations.ts # i18n translations
├── pages/              # Route components
└── routes.tsx          # Route configuration
```

### Key Features & Components

#### Authentication & Authorization
- Multi-role system: `guest`, `user`, `admin`, `superadmin`
- Protected routes with role-based access control
- Session persistence with Supabase Auth

#### Device Management
- Real-time monitoring of IoT devices
- Device access mapping for user permissions
- Measurement history tracking

#### Graph Monitoring
- Real-time data visualization with Recharts
- Multiple graph styles (Classic, Gradient, Neon, etc.)
- Preset configurations for common views
- Responsive design for mobile/desktop

#### Notification System
- Push notifications via Firebase Cloud Messaging
- User-specific notification preferences
- Notification history tracking
- Cross-user notification support

### Database Schema Key Tables
- `rice_quality_analysis` - Rice quality measurements
- `devices` - IoT device registry
- `user_notification_settings` - User notification preferences
- `device_access_mapping` - User-device access control
- `news_articles` - News content management

### Important Configuration Files
- `capacitor.config.ts` - Mobile app configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*` → `./src/*`)

### Environment & Deployment
- Development server: `http://localhost:8080`
- Production hostname: `setup.riceflow.app`
- App ID: `setup.riceflow.app`
- Native app name: `Riceflow`

### Testing Approach
The project uses TypeScript's built-in type checking. No dedicated test runner is configured yet. For testing:
- Type checking: TypeScript compiler handles type safety
- Component testing: Manual testing in development mode
- Consider adding Vitest or Jest for unit testing