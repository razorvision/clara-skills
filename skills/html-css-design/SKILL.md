---
name: html-css-design
description: Reviews and guides the design and styling of plain HTML/CSS websites and static pages through a visual audit at desktop, tablet, and mobile widths, checking consistency, color, typography, spacing, responsiveness, interaction states, and accessibility, then produces a prioritized audit report. Use when designing, building, or reviewing a plain HTML/CSS site or static page, or when the user asks for a visual or CSS design audit.
license: Apache-2.0
compatibility: Works best with a Playwright MCP server for multi-viewport screenshots.
metadata:
  version: "0.1.1" # x-release-please-version
  owner: razorvision
---

# HTML/CSS Design Review Skill

Apply this skill when designing, creating, or reviewing plain HTML/CSS websites and static pages.

## Visual Audit Process

### 1. Take Screenshots
Use Playwright (or another browser automation tool, if available) to capture each page at multiple viewports:

```
Desktop: 1440x900
Tablet: 768x1024
Mobile: 375x812
```

If no browser tool is available, audit from the source files and say that the visual pass was not run.

### 2. Check Visual Consistency

Across all pages, verify:
- [ ] Same navigation bar (logo, links, CTA button)
- [ ] Same footer (links, copyright, layout)
- [ ] Consistent heading styles (size, weight, color)
- [ ] Consistent button styles (colors, padding, hover states)
- [ ] Consistent spacing between sections
- [ ] Same gradient colors and direction (if gradients are used)

### 3. Color Audit

Use the project's design tokens as the source of truth. Look for a brand guide, a style guide, or the `:root` custom properties in the main stylesheet. If the project has none, pick a palette with the user and define it as CSS variables before auditing against it:

```css
/* Example token set: replace the values with the project's own */
:root {
  --color-primary: <primary>;
  --color-secondary: <secondary>;
  --color-text: <dark text>;
  --color-text-muted: <light text>;
  --color-bg: <page background>;
  --color-surface: <card background>;
  --color-success: <success>;
  --color-warning: <warning>;
  --color-error: <error>;
}
```

Look for:
- [ ] No hardcoded colors outside the defined palette
- [ ] Consistent link colors
- [ ] Proper contrast ratios (4.5:1 for text)
- [ ] Gradient direction consistent across pages (if gradients are used)

### 4. Typography Audit

Check text hierarchy:
```css
/* Expected scale */
H1: 2.5em - 3em, bold
H2: 1.5em - 1.8em, bold
H3: 1.2em - 1.4em, semibold
Body: 1em (16px base), regular
Small: 0.9em, regular
```

Verify:
- [ ] Consistent font-family across pages
- [ ] Logical heading hierarchy (h1 > h2 > h3)
- [ ] Line-height 1.5-1.7 for body text
- [ ] Max line length ~75 characters

### 5. Spacing Audit

Check consistent spacing:
```css
/* Common spacing scale */
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

Verify:
- [ ] Section padding consistent (40-80px)
- [ ] Card padding consistent
- [ ] Element margins follow scale
- [ ] No arbitrary spacing values

### 6. Responsive Design

Check at each breakpoint:
- [ ] Navigation collapses appropriately on mobile
- [ ] Text remains readable (no horizontal scroll)
- [ ] Images scale properly
- [ ] Buttons/CTAs remain tappable (min 44x44px)
- [ ] Grid layouts reflow to fewer columns
- [ ] No content overflow or cutoff

### 7. Interactive Elements

Check all buttons and links:
- [ ] Hover states present and consistent
- [ ] Focus states for accessibility
- [ ] Active/pressed states
- [ ] Cursor changes appropriately
- [ ] Transition timing consistent (0.2-0.3s)

### 8. Layout Patterns

Verify consistent layout:
```css
/* Container widths */
Max-width: 1000-1200px
Side padding: 20-40px
Center alignment: margin: 0 auto
```

Check:
- [ ] Content centered consistently
- [ ] Sidebars align across doc pages
- [ ] Cards have equal heights in grids
- [ ] Footer sticks to bottom

## CSS Best Practices

### Good Patterns
```css
/* Use relative units */
font-size: 1.1em;
padding: 1rem 2rem;
max-width: 800px;

/* Mobile-first media queries */
@media (min-width: 768px) { }

/* Semantic selectors */
.nav-bar { }
.hero-section { }
.card-title { }

/* CSS custom properties for theming: reference tokens, never raw values */
.button-primary {
  background: var(--color-primary);
  color: var(--color-surface);
}
```

### Anti-Patterns
```css
/* Avoid: Pixel-based font sizes */
font-size: 14px;  /* Use em or rem */

/* Avoid: Important overrides */
color: red !important;

/* Avoid: Deep nesting */
.page .section .card .header .title { }

/* Avoid: Non-semantic class names */
.blue-box { }
.mt-20 { }  /* Unless using utility framework */

/* Avoid: Inline styles for layout */
style="margin-top: 20px"
```

## Accessibility Checklist

- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 large text)
- [ ] Focus indicators visible
- [ ] Links distinguishable (not just color)
- [ ] Form labels associated with inputs
- [ ] Alt text on images
- [ ] Semantic HTML (nav, main, aside, footer)
- [ ] Skip link for keyboard users
- [ ] No content conveyed by color alone

## Common Issues to Flag

1. **Inconsistent nav/footer** - Different links or styling between pages
2. **Missing hover states** - Buttons/links with no visual feedback
3. **Broken responsive** - Content overflows or becomes unreadable
4. **Color inconsistency** - Different shades of the same palette color
5. **Spacing irregularity** - Random padding/margin values
6. **Typography hierarchy** - Skipped heading levels or inconsistent sizes
7. **Missing meta tags** - No viewport, description, or favicon
8. **External links** - Missing rel="noopener" on target="_blank"

## Review Output Format

After auditing, provide:

```markdown
## Visual Design Audit Report

### Overall Score: X/10

### Strengths
- [List what's done well]

### Issues Found
1. **[Issue name]** - [Page/location]
   - Problem: [Description]
   - Fix: [Recommendation]
   - Priority: High/Medium/Low

### Screenshots
[Attach or reference screenshots]

### Recommendations
- [Prioritized list of improvements]
```
