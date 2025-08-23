# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoliReserve Enhanced - Hotel management system for social housing establishments built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Essential Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint checks
npm start            # Production server

# Testing
npm run test:rooms:all      # Run all room tests
npm run test:rooms:e2e      # End-to-end room tests
npm run validate:rooms      # Full room validation suite
```

## Environment Configuration

Required `.env.local` variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Code Architecture

### Project Structure
- **app/** - Next.js 14 App Router pages
- **components/features/** - Business logic components (ClientManagement, ReservationsTable, etc.)
- **components/pages/** - Full page components 
- **components/layout/** - AuthGuard, Sidebar, Header
- **components/ui/** - Reusable UI components (shadcn/ui pattern)
- **hooks/** - Custom React hooks for data fetching and state
- **lib/supabase.ts** - Database client with TypeScript types
- **lib/api/** - API layer for establishments and rooms

### Key Patterns

**Component Pattern:**
```typescript
// components/features/ComponentName.tsx
import { supabase, type TypeName } from '@/lib/supabase';
import { Button } from '../ui/button';

interface Props {
  data: TypeName[];
}

export default function ComponentName({ data }: Props) {
  // Implementation
}
```

**Database Operations:**
- Use hooks from `hooks/useSupabase.ts` (useHotels, useRooms, useReservations, etc.)
- For new queries, extend existing hooks or create in same pattern
- Always handle loading/error states

**Authentication:**
- All protected pages must use `<AuthGuard>` wrapper
- Auth state managed via `hooks/useAuth.ts`
- Role-based access: admin, manager, comptable, receptionniste

## Database Schema

Primary tables with relationships:
- **hotels** → has many → **rooms**
- **reservations** → belongs to → **clients**, **rooms**, **operateurs_sociaux**
- **conventions_prix** → links → **hotels** ↔ **operateurs_sociaux**
- **users** → manages system access with roles

## TypeScript Configuration

- Strict mode enabled
- Path alias: `@/*` maps to project root
- All components must be properly typed
- Database types defined in `lib/supabase.ts`

## Testing Strategy

Room management tests in `tests/` directory:
- End-to-end testing with real Supabase
- Error handling validation
- Performance benchmarks
- Data consistency checks

## Critical Guidelines

1. **Always use existing UI components** from `components/ui/`
2. **Import types** from `@/lib/supabase` 
3. **Wrap async operations** in try-catch blocks
4. **Use Tailwind classes** for styling (no inline styles)
5. **Follow existing patterns** - check similar components first
6. **Handle loading states** with consistent UX patterns
7. **Use toast notifications** via `useNotifications` hook

## Common Workflows

### Adding a new feature:
1. Create component in `components/features/`
2. Add types to `lib/supabase.ts` if needed
3. Create/extend hook in `hooks/useSupabase.ts`
4. Add to relevant page component
5. Update sidebar navigation if needed

### Database changes:
1. Create migration in `supabase/migrations/`
2. Update types in `lib/supabase.ts`
3. Update relevant hooks
4. Test with existing data

### Debugging:
- Check browser console for client errors
- Verify Supabase connection in Network tab
- Use `console.log` in development only
- Check `supabase/config.toml` for local setup