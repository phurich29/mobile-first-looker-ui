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

### Supabase Local Development
```bash
supabase start       # Start local Supabase instance
supabase db push     # Apply migrations to local database
supabase migration new <name>  # Create new migration
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
1. **Infinite Recursion**: RLS policies causing recursion in `user_roles` table
   - Temporary solution: Disable RLS on problematic tables
   - Long-term: Implement hybrid approach (Application + simplified RLS)
2. **Permission System**: Multiple redundant permission checks across components
   - Solution: Centralize in `PermissionService`
3. **API Optimization**: Same data fetched multiple times
   - Solution: Implement caching strategy with React Query

### Migration Status (Total: 31 tasks)
- **Phase 1**: Emergency fix for RLS recursion (0/16 tasks)
- **Phase 2**: Core refactoring for performance (0/8 tasks)  
- **Phase 3**: Enhanced security implementation (0/7 tasks)

### Known Issues & Workarounds
- **Guest Access**: May show empty device list - check `guest_device_access` table
- **Device Filtering**: Admin visibility controlled by `admin_device_visibility`
- **Performance**: Initial load may be slow due to multiple permission checks

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

### Core Tables
```sql
-- User & Permission Tables
user_roles              # User permission levels (guest, user, admin, superadmin)
device_permissions      # Maps users to devices they can access
admin_device_visibility # Controls which devices admins can see
guest_device_access     # Public device access configuration

-- Data Tables  
rice_quality_analysis   # Main measurement data (device_id, rice_type, quality metrics)
device_settings         # Device configuration and display preferences
devices                 # Device registry (linked via device_id)
```

### Common Queries
```typescript
// Get user permissions
const { data: userRole } = useQuery({
  queryKey: ['userRole', userId],
  queryFn: () => supabase.from('user_roles').select('*').eq('user_id', userId)
});

// Get device access
const { data: devices } = useDeviceAccess(userId);
```

## API Patterns & Conventions

### Query Patterns
```typescript
// Use React Query hooks for data fetching
import { useQuery, useMutation } from '@tanstack/react-query';

// Naming convention: use[Resource][Action]
useDeviceData()      // Fetch device data
useCreateDevice()    // Create mutation
useUpdateSettings()  // Update mutation
```

### Error Handling
```typescript
// Consistent error handling with toast
import { toast } from 'sonner';

try {
  // operation
} catch (error) {
  toast.error('Operation failed');
  console.error('Detailed error:', error);
}
```

### Supabase Integration
- Client instance: `@/integrations/supabase/client`
- Type definitions: `@/integrations/supabase/types`
- Custom hooks: `@/integrations/supabase/hooks/`
- Always check for auth state before protected operations

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

## Development Workflow

### Standard Component Pattern
```typescript
// 1. Import dependencies
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

// 2. Define types (if needed)
interface ComponentProps {
  deviceId: string;
}

// 3. Component with proper error handling
export function MyComponent({ deviceId }: ComponentProps) {
  // Use React Query for server state
  const { data, isLoading, error } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading device</div>;

  return (
    <Card className="p-4">
      {/* Component content */}
    </Card>
  );
}
```

### Adding New Features
1. Check existing patterns in similar features
2. Use existing UI components from `@/components/ui/`
3. Follow mobile-first responsive design
4. Test with different user roles (guest, user, admin)

### Working with Permissions
```typescript
// Always check permissions before sensitive operations
const { userRole } = useAuth();

if (!userRole || userRole === 'guest') {
  toast.error('You need to be logged in');
  return;
}

if (userRole !== 'admin' && userRole !== 'superadmin') {
  toast.error('Admin access required');
  return;
}
```

## Standard Workflow
1. **Plan First**: Think through the problem and create a plan
2. **Check Existing Code**: Look for similar patterns in the codebase
3. **Start Simple**: Make minimal changes that achieve the goal
4. **Test As You Go**: Verify each change works before moving on
5. **Follow Conventions**: Match existing code style and patterns
6. **Handle Errors**: Always include proper error handling
7. **Communicate in Thai**: ตอบและอธิบายเป็นภาษาไทยเสมอ

## Important Reminders
- Focus on simplicity - avoid complex changes
- Prefer editing existing files over creating new ones
- Follow existing patterns and conventions
- Test with different user roles
- Handle loading and error states properly
