# AI maintainer guide

## Repository role

This is the frontend fork for the Remnawave dual-core project.

- Fork: `Cd1s/remnawave-frontend`
- Maintained branch: `singbox`
- Upstream: `remnawave/frontend` branch `main`
- Artifact: frontend files embedded into the forked backend image

This repository owns presentation and editing only. The backend remains authoritative for API
contracts and stored behavior; the Node remains authoritative for core runtime behavior.

The cross-repository source of truth is
[`Cd1s/remnawave-singbox`](https://github.com/Cd1s/remnawave-singbox). Read its project map,
feature registry, and upstream maintenance guide before changing shared behavior.

## Fork-specific behavior

The `singbox` branch adds:

- Xray/sing-box config-profile selection;
- a sing-box JSON schema and Monaco editor validation;
- core-aware config profile creation and editing;
- core identity and version display for profiles and Nodes;
- AnyTLS-compatible editing through the sing-box schema;
- automatic upstream synchronization and branch validation.

Important implementation areas include:

- `src/shared/api/contracts/core-contract.ts`
- `src/shared/schemas/singbox.schema.json`
- `src/shared/ui/core-logo.tsx`
- `src/shared/utils/core-utils.ts`
- `src/features/dashboard/config-profiles/`
- `src/widgets/dashboard/config-profiles/`
- `src/widgets/dashboard/nodes/`

Before changing fork behavior, inspect the real delta:

```bash
git diff --name-status upstream/main...HEAD
git log --oneline upstream/main..HEAD
```

## Compatibility invariants

1. Existing Xray profile creation, editing, validation, and display remain unchanged.
2. Xray remains the default when the API does not explicitly provide a core type.
3. The UI sends only backend-supported `coreType` values and contract fields.
4. Native sing-box JSON is not transformed into Xray-shaped JSON.
5. Editor schema switching does not overwrite an existing profile.
6. Unknown or temporarily missing core-version metadata degrades gracefully.
7. Frontend support never implies that the backend or Node implements an unsupported protocol.

## How to add a custom feature

Register the feature in the central `docs/custom-feature-registry.md` first. If it changes an API
field, runtime behavior, subscription format, or Node status, coordinate the backend or Node change
instead of inventing a frontend-only contract.

Prefer:

- shared core-aware helpers instead of repeated string comparisons;
- additive UI controls hidden or disabled when the backend does not support them;
- schemas that preserve native core field names;
- small components around upstream screens rather than duplicated pages;
- tests or type-level checks that encode fallback behavior.

Avoid:

- hard-coded deployment data;
- frontend-only protocol semantics;
- copying large upstream components to make a small fork change;
- changing generated or upstream API types without matching backend support.

When upstream introduces an equivalent UI, converge on the upstream component and retain only the
minimum adapter required for fork-only backend or Node behavior.

## Upstream synchronization failure

The scheduled workflow pushes only after type checking, formatting/linting, and a production build
pass. A conflict or failed validation leaves `origin/singbox` unchanged.

Repair procedure:

1. Create a temporary branch from `origin/singbox`.
2. Merge `upstream/main`; do not force-push or rebase the maintained branch.
3. Resolve conflicts by preserving upstream layout and the compatibility invariants above.
4. Recheck backend contract changes before altering local types.
5. Run all validation gates.
6. Test profile create/edit flows for both Xray and sing-box.
7. Merge the repair into `singbox` and let CI publish the artifact.

## Validation gates

Use Node.js 24 and run:

```bash
npm ci --no-audit --no-fund
npm run typecheck
npm run check
npm run start:build
```

For core-profile changes, validate the built frontend against the matching backend branch, not only
against mocks or TypeScript types.

## Definition of done

A frontend change is complete only when:

- both Xray and sing-box profile paths work;
- backend contract compatibility is confirmed;
- loading older data does not crash the UI;
- the central feature registry is updated when behavior changes;
- no infrastructure identifiers or secrets are committed.
