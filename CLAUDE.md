# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Riceflow Setup is a Progressive Web App (PWA) for rice quality analysis with AI Deep Learning Vision Technology. The app supports Thai language and is built using React, TypeScript, and Supabase.

## Key Commands

### Development
```bash
npm run dev          # Start development server on port 8080
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Git Workflow
The project is integrated with Lovable.dev. Changes made via Lovable are automatically committed. When working locally, standard git commands apply.

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn-ui (Radix UI + Tailwind CSS)
- **State Management**: TanStack Query (React Query) + React Context API
- **Backend**: Supabase (PostgreSQL with Row Level Security, Auth, Realtime)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **PWA**: Vite PWA plugin with Workbox
- **Notifications**: OneSignal integration

### Project Structure
```
src/
├── components/       # Reusable UI components
├── features/        # Feature-specific modules
├── pages/           # Route pages/views
├── hooks/           # Custom React hooks
├── contexts/        # React contexts (Auth, Theme, PWA, Countdown)
├── integrations/    # External services (Supabase)
├── utils/           # Utility functions
└── lib/            # Library configurations
```

### Key Features
1. **Authentication**: Role-based access (Guest, User, Admin, SuperAdmin)
2. **Device Management**: Managing rice analysis devices
3. **Measurements**: Recording and displaying rice quality data
4. **Real-time Updates**: Using Supabase Realtime
5. **PWA Support**: Installable mobile app with offline capabilities
6. **Theme Support**: Light/dark mode with system preference detection

## Current Issues & Considerations

### Critical Issues (from docs/TASK_MANAGER.md)
1. **Infinite Recursion**: RLS policies causing recursion - Phase 1 migration in progress
2. **Permission System**: Needs refactoring for better performance
3. **API Optimization**: Redundant calls need consolidation

### Migration Status
**Phase 1**: Emergency fix for RLS recursion (0/16 tasks completed)
**Phase 2**: Core refactoring for performance (0/8 tasks)
**Phase 3**: Enhanced security implementation (0/7 tasks)

### Development Guidelines
1. **TypeScript**: Project uses relaxed TypeScript settings - focus on functionality over strict typing
2. **Component Style**: Follow existing shadcn-ui patterns and Tailwind conventions
3. **Path Aliases**: Use `@/` for imports from src directory
4. **State Management**: 
   - Use React Query for server state
   - Use Context API for client state
   - Avoid prop drilling - use contexts or custom hooks

### Supabase Integration
- Database migrations in `supabase/migrations/`
- Edge functions in `supabase/functions/`
- RLS policies currently being refactored (see TASK_MANAGER.md)
- Auth endpoints excluded from PWA caching

### Mobile-First Design
- All components should be responsive
- Test on mobile viewport sizes first
- Use Tailwind's responsive utilities
- Consider touch interactions

## Important Files
- `src/components/AuthProvider.tsx` - Main authentication logic
- `src/components/ProtectedRoute.tsx` - Route protection implementation
- `src/integrations/supabase/` - Supabase client and types
- `vite.config.ts` - Build configuration and PWA settings
- `docs/TASK_MANAGER.md` - Current migration tasks and issues

## Testing
Currently no testing framework is configured. When implementing tests:
- Check for testing setup in package.json first
- Follow React Testing Library conventions if added
- Test critical user flows and permissions

## Database Schema & Key Tables
- **admin_device_visibility**: Device visibility control for admins
- **device_settings**: Device configuration and display settings
- **guest_device_access**: Guest user access permissions
- **rice_quality_analysis**: Main data table for rice analysis
- **user_roles**: User permission system
- **device_permissions**: Device access control

## API Patterns
- All API calls use `@/integrations/supabase/client`
- Use React Query hooks from `@/integrations/supabase/hooks/`
- Follow existing query/mutation patterns in feature directories
- Handle errors consistently with toast notifications

## Common Development Tasks

### Running a Single Component
```bash
npm run dev              # Start dev server
# Navigate to specific route in browser
```

### Checking TypeScript Errors
```bash
npm run build            # Will show any TS errors
# or check specific files in your IDE
```

### Database Changes
```bash
# Create new migration
supabase migration new <migration_name>
# Apply migrations locally
supabase db push
```

### Working with Supabase Locally
- Ensure Supabase CLI is installed
- Use `supabase start` for local development
- Environment variables in `.env.local` (not tracked)

## Deployment
- Lovable.dev handles deployment automatically
- Custom domains can be configured in Lovable project settings
- PWA manifest configured for "Riceflow Setup" branding

## Standard Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.
8. Explain and reply in Thai language only