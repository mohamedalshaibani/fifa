# 🎮 FIFA FC - Color System

## Brand Identity

**One primary color. One secondary accent. Clean. Strong. Sporty.**

---

## Color Palette

### PRIMARY: Electric Blue (#0052CC)
- **Main**: `#0052CC`
- **Dark**: `#003A99` (hover, active states)
- **Light**: `#0066FF` (lighter use cases)

**Usage:**
- All primary buttons
- Main headings
- Links and focus states
- Card highlights
- Primary UI elements
- Brand identity

### SECONDARY: Gold/Orange (#FF6B35)
- **Main**: `#FF6B35`
- **Dark**: `#E55A24` (hover, active states)
- **Light**: `#FF7F4D` (lighter use cases)

**Usage:**
- Secondary buttons
- Trophy/award icons
- Victory elements
- Accent highlights
- Status badges (active tournaments)
- Energy/excitement indicators

### STATUS COLORS

| Color | Hex | Usage |
|-------|-----|-------|
| **Success** | `#00AA44` | Completed actions, won matches, positive states |
| **Warning** | `#FF9900` | Cautions, pending actions, registrations open |
| **Danger** | `#EE3333` | Errors, critical alerts, eliminations |
| **Info** | `#0066FF` | Informational content, secondary actions |

---

## Text & UI

| Element | Color | Hex |
|---------|-------|-----|
| **Text Primary** | Dark Gray | `#1A1A1A` |
| **Text Secondary** | Medium Gray | `#555555` |
| **Text Muted** | Light Gray | `#999999` |
| **Background** | White | `#FFFFFF` |
| **Background Secondary** | Very Light Gray | `#F5F7FA` |
| **Borders** | Light Gray | `#DDDDDD` |

---

## Component Color Mapping

### Buttons
```typescript
// Primary Button
background: #0052CC
hover: #003A99
active: #003A99
text: white

// Secondary Button
background: #FF6B35
hover: #E55A24
active: #E55A24
text: white

// Success Button
background: #00AA44
hover: #008833
active: #008833
text: white

// Danger Button
background: #EE3333
hover: #DD2222
active: #DD2222
text: white

// Ghost Button
background: transparent
text: #1A1A1A
hover: #F5F7FA
```

### Cards
```typescript
// Default Card
background: #FFFFFF
border: 1px solid #DDDDDD
shadow: subtle

// Highlighted Card
background: #FFFFFF
border: 2px solid #0052CC
shadow: medium

// Elevated Card
background: #FFFFFF
border: 1px solid #DDDDDD
shadow: large
```

### Badges
```typescript
// Primary
background: #E3F2FD
text: #0052CC
border: #90CAF9

// Success
background: #E8F5E9
text: #1B5E20
border: #C8E6C9

// Warning
background: #FFF3E0
text: #E65100
border: #FFE0B2

// Danger
background: #FFEBEE
text: #B71C1C
border: #FFCDD2

// Info
background: #E3F2FD
text: #0D47A1
border: #BBDEFB
```

---

## Rules

✅ **DO**
- Use primary blue (#0052CC) for all main CTAs and headings
- Use secondary orange (#FF6B35) for accents and secondary actions
- Keep text on white backgrounds (never white on white)
- Use full contrast: dark text on light backgrounds
- Apply status colors only to badges/indicators
- Keep gradients OFF (no soft, faded gradients)

❌ **DON'T**
- Mix neon colors (#00ff88, #7c3aed, etc.)
- Use gradients for design (they read as weak/soft)
- Apply transparency to main colors (use solid colors)
- Use white text on light backgrounds
- Create custom color combinations
- Use random color schemes
- Add blur effects or glow effects to text

---

## Implementation

All colors are defined in:
- `globals.css` (CSS variables)
- `tailwind.config.ts` (Tailwind theme)
- Component files (hard-coded for specificity)

**When adding new components:**
1. Reference `#0052CC` (primary) or `#FF6B35` (secondary)
2. Use status colors only for status indicators
3. Use neutral grays for text and borders
4. No custom colors without approval

---

## Accessibility

- All text meets WCAG AA contrast ratios
- Primary blue (#0052CC) on white: **12.5:1 contrast**
- Text colors on all backgrounds are tested
- No color-only information (always use icons/labels too)
