# Segfault design system

Segfault uses the neobrutalism.dev visual grammar adapted to its static Astro site.

## Tokens

- `--background`: light blue default page surface
- `--secondary-background`: white cards and controls
- `--main`: blue primary surface
- `--chart-2`: red status accent
- `--chart-3`: yellow utility accent
- `--chart-4`: green success accent
- black 2px borders, 5px radius, and a 4px hard shadow
- JetBrains Mono for the technical voice

## Components

Cards, panels, metadata, and buttons share the same border/radius/shadow recipe. Interactive elements use the neobrutalism.dev motion grammar: translate 4px on hover/focus and remove the shadow. Native audio remains the playback control.

## Themes

The header includes an accessible native disclosure palette picker with blue, pink, yellow, and green themes. The selected theme is stored in `localStorage` as `segfault-theme`; the blue palette is the fallback when storage is unavailable.

## Responsive behavior

The header stacks on compact screens. The hero becomes a vertical panel and the palette control remains visible beside the navigation. Episode cards keep their index block and readable single-column content.

## Accessibility

The site preserves semantic headings, native disclosure behavior, visible focus rings, keyboard-accessible controls, reduced-motion handling, and status messaging for missing audio metadata.
