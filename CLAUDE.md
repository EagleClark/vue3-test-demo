# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type check with vue-tsc and build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest tests |
| `npm run test -- --ui` | Run Vitest with UI interface |
| `npm run test -- --coverage` | Run tests with coverage report |

## Architecture

This is a Vue 3 + TypeScript + Vite Single Page Application (SPA) using the Composition API with `<script setup>` syntax.

### Tech Stack
- **Vue 3** with Composition API and `<script setup>` SFCs
- **TypeScript** with strict mode enabled
- **Vite** as build tool and dev server
- **Vue Router** for client-side routing (HTML5 history mode)
- **Pinia** for state management
- **Element Plus** as UI component library
- **Vitest** with happy-dom for testing

### Directory Structure

```
src/
├── api/           # API layer (prepared for future API calls)
├── assets/        # Static assets
├── components/    # Reusable Vue components
├── layouts/       # Layout components (MainLayout.vue)
├── router/        # Vue Router configuration
├── stores/        # Pinia stores (user authentication, user list management)
├── types/         # TypeScript type definitions
├── utils/         # Utility functions (localStorage wrapper)
└── views/         # Page-level components (Login.vue, UserManagement.vue)
```

### State Management (Pinia)

The project uses Pinia setup stores. Stores are defined using `defineStore('name', () => { ... })` returning state, getters, and actions.

**Key Stores:**
- `useUserStore` - Authentication state (token, userInfo), persisted via localStorage
- `useUserListStore` - User list CRUD operations with in-memory mock data

Stores are initialized in `src/main.ts` with `useUserStore().init()` to restore persisted state.

### Routing

Routes are defined in `src/router/index.ts` with programmatic configuration (not file-based). Key patterns:

1. **Lazy loading**: Components are imported dynamically: `component: () => import('@/views/Page.vue')`
2. **Route meta**: Each route has `meta.title` and `meta.requiresAuth`
3. **Global beforeEach guard**:
   - Redirects unauthenticated users to `/login` with redirect query
   - Prevents logged-in users from accessing `/login`
   - Sets document title from route meta

### Mock Authentication

The project uses mock authentication:
- Default credentials: `admin` / `123456`
- Token stored in localStorage via `src/utils/storage.ts`
- Super admin (userId: 1) is protected from deletion and role changes

### Testing

Vitest is configured with `happy-dom` environment. Test files should be placed in the `tests/` directory. Use `@vue/test-utils` for component testing.

### Path Alias

Use `@` to reference the `src` directory: `import Component from '@/components/Component.vue'`