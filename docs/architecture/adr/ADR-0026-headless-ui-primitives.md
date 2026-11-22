# ADR-0026: Headless UI Primitives Choice

## Context
Meridian's web frontend (`apps/web`) requires an accessible, robust component architecture for interactive UI elements including modal dialogs, tab navigation, collapsible panels, tooltips, popovers, and switch controls. We need an accessible foundation compliant with W3C WAI-ARIA authoring practices, with zero stylistic opinion, full keyboard navigation, screen-reader support, focus management, and seamless integration with Tailwind CSS v4 and React 19.

We evaluated three leading headless UI primitive libraries:
1. **Radix UI Primitives (`@radix-ui/react-*`)**
2. **React Aria Components (`react-aria-components`)**
3. **Base UI (`@base-ui-components/react`)**

## Decision
We select **Radix UI Primitives (`@radix-ui/react-*`)** as the primary headless component foundation for `@meridian/ui`.

Key reasons:
1. **Unstyled & Composable:** Radix primitives render clean DOM nodes without baked-in styles, allowing complete styling control via Tailwind CSS classes and CSS custom properties defined in `@meridian/design-tokens`.
2. **WAI-ARIA & Accessibility Rigor:** Built-in ARIA role semantics, full keyboard navigation (Enter, Space, Arrow keys, Esc), roving tabindex, and automatic focus management (restoration, trapping inside dialogs, focus trapping).
3. **Granular Package Structure:** Each primitive is a distinct npm package (`@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-switch`, `@radix-ui/react-tooltip`, `@radix-ui/react-dropdown-menu`), ensuring optimal bundle tree-shaking and zero unnecessary dependencies.
4. **React 19 Compatibility:** Radix primitives cleanly support React 19 forwardRef and children patterns without runtime warnings.
5. **Permissive Licensing:** Released under the MIT license, fully compliant with Meridian's open-source licensing policy.
6. **Iconography:** Paired with `lucide-react` (ISC license), providing clean, accessible SVG stroke icons that match Meridian's cartographic line weights.

## Alternatives considered
- **React Aria Components:** Powerful and highly accessible, but introduces significant conceptual overhead (collection components, state machines) and heavier bundle weight.
- **Base UI:** Promising headless system from the MUI team, but currently less mature in ecosystem adoption and documentation for edge cases compared to Radix.
- **Building In-House from Raw HTML:** Exposes the project to substantial accessibility regressions (focus trapping, roving tabindex, ARIA state sync across browsers and assistive technologies).

## Consequences
- **Positive:** Guaranteed WCAG 2.1 AA compliance for interactive controls; predictable keyboard behavior; completely decoupled design system styles.
- **Negative:** Developers must ensure every interactive icon button passes a descriptive `aria-label` or wraps a `<VisuallyHidden>` label to maintain accessibility.

## Evidence/links
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- W3C WAI-ARIA Authoring Practices Guide (APG)
- `docs/design/design-language.md`

## Status
Approved
