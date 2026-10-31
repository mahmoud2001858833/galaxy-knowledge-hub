# Architecture rules
- Keep recycling advisor emissions in a deterministic client-side calculation module; AI suggests materials but never supplies authoritative carbon totals.
- Scope recycling expert theme tokens to its page and portal dialogs so unrelated platform sections retain their existing appearance.
- Store recycling favorites and self-reported completion records locally, separate from any authorization or user-role decisions.
# Platform identity & design system
- Sections, navigation and future projects come from `src/config/platformSections.ts`; read `docs/PLATFORM_IDENTITY.md` before adding or moving a page.
- New and migrated pages use `PageShell`/`PageHeader`/`PageCardLink` from `src/components/layout/PageShell.tsx` and only design tokens (`bg-background`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `from-brand-from to-brand-to`) — no hardcoded colors. See `docs/DESIGN_SYSTEM.md`.
- Pages under future projects (Damij, GJU "مستقبل التكنولوجيا") are parked: security fixes only.
