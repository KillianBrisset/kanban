# Kanban Monorepo

A lightweight Kanban toolkit split into two packages:

- Core utilities and domain types: `packages/core`
- React UI components and drag-and-drop logic: `packages/react`

This repository is a pnpm workspace written in TypeScript.

## Packages

- @killianbrisset/kanban-core

  - Source: `packages/core`
  - Exports small helpers like `sortColumns`, `sortCards`, and shared types: `KanbanState`, `KanbanCard`, `KanbanColumn`, etc.

- @killianbrisset/kanban-react
  - Source: `packages/react`
  - Exports the `KanbanBoard` component, a `useKanban` hook, and small UI bits (`Avatar`, `Badge`, `DueDatePill`).
  - Storybook demonstrates theming and usage.

## Prerequisites

- Node.js 18+ recommended
- pnpm (this repo sets `packageManager: pnpm@10.x`)

## Install dependencies

```powershell
pnpm install
```

## Common workspace commands

- Build all packages

  ```powershell
  pnpm build
  ```

- Run tests (if any)

  ```powershell
  pnpm test
  ```

- Lint

  ```powershell
  pnpm lint
  ```

- Run Storybook for the React package
  ```powershell
  pnpm --filter @killianbrisset/kanban-react storybook
  ```

## Developing locally

- Each package is built with tsup to ESM and CJS with type declarations in `dist/`.
- The React package uses Storybook (Vite-based) for local playground and docs.
- Types are shared via `@killianbrisset/kanban-core` and re-used by the React components.

## Releasing

This repo is configured to use Changesets via `@changesets/cli`.

- Create a changeset interactively:
  ```powershell
  pnpm changeset
  ```
- Publish (build all + publish from workspaces):
  ```powershell
  pnpm release
  ```

## Repository structure

```
packages/
  core/
    src/
      index.ts
      types.ts
  react/
    src/
      KanbanBoard.tsx
      KanbanBoard.stories.tsx
      useKanban.ts
      components/
        Avatar.tsx
        Badge.tsx
        DueDatePill.tsx
      styles/
        base.scss
```

## License

MIT
