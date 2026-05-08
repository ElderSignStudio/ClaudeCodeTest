## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# Outer Signal — Claude Code Guidelines

## Project Overview

Outer Signal is a discovery platform focused on surfacing early, obscure signals.

Core idea:
Reward users who discover and amplify content before it becomes popular.

Key concepts:
- Items (content, initially music)
- Amplification (sharing something forward)
- Discovery (finding something early)
- Lanes (horizontal feeds of content)
- Propagation (how content spreads across users)

---

## Current Phase (VERY IMPORTANT)

We are in a **frontend-only prototype phase**.

- DO NOT implement backend logic
- DO NOT add Supabase, database, or API routes
- DO NOT implement authentication
- USE ONLY local mock/dummy data

The goal is to build a **fully functional UI prototype** to validate:
- UX
- layout
- interaction model
- overall product feel

All data should be easily replaceable later by a real backend.

---

## Tech Stack

- SvelteKit (latest)
- TypeScript
- Tailwind CSS
- daisyUI

---

## Core Principles

### 1. Simplicity first
- Prefer the simplest solution that works
- Avoid unnecessary abstractions
- Do NOT introduce service layers, repositories, or complex patterns unless explicitly requested

### 2. Idiomatic SvelteKit
- Follow standard SvelteKit conventions
- Use `+page.svelte`, `+layout.svelte`, and load functions properly
- Do not reinvent patterns that SvelteKit already provides

### 3. Frontend-driven structure
- Organize by feature where possible
- Keep components small and composable
- Prioritize readability over cleverness

### 4. Future-ready, not premature
- Structure code so a backend can be added later
- But DO NOT implement backend logic now
- Mock data should resemble realistic data shapes

---

## UI / UX Principles

- Clean, modern, minimal
- Focus on exploration and curiosity
- Avoid clutter
- Emphasize content over UI chrome
- Design should feel lightweight and fluid
- Prioritize clarity of user actions (e.g. amplify, save)

### Visual Tone

Information density should feel intentional and curated.

Outer Signal should feel:

- atmospheric
- exploratory
- spatial
- calm
- intelligent
- subtle
- slightly mysterious

Avoid:
- overly corporate UI
- loud gradients
- excessive glow
- gamified feeling
- visual clutter
- oversized typography
- excessive animation
- excessively sparse "landing page" aesthetics
- oversized cards
- giant typography
- excessive whitespace that reduces discovery density

Prefer:
- restrained motion
- layered depth
- soft contrast
- compact but readable information density
- elegant spacing
- subtle visual hierarchy
- compact layouts with breathing room
- layered information hierarchy
- subtle metadata
- interfaces that reward exploration

---

## Learning Mode (CRITICAL)

The developer is learning SvelteKit and wants to understand decisions.

ALWAYS:

- Explain WHY you chose a solution, not just WHAT you did
- Prefer clear, teachable solutions over clever ones
- Highlight best practices
- Point out anything non-obvious
- Keep explanations concise but meaningful

WHEN RELEVANT:

- Mention alternative approaches briefly
- Explain why your approach is preferable

---

## Workflow Rules

Prefer iterative refinement over large rewrites unless explicitly requested.

When improving UI:
- preserve existing structure when possible
- refine incrementally
- avoid replacing working systems unnecessarily

For each task:

### Before coding
- Explain your plan briefly
- List which files you will create or modify
- Highlight any important decisions

### After coding
- Explain what you implemented
- Explain why you structured it this way
- Point out anything that deserves attention or review
- If UI was changed, mention whether Playwright/browser verification was performed

---

## Playwright Browser Verification

Playwright is installed primarily to help Claude Code inspect and verify the rendered UI in a real browser.

The current goal is NOT to build a large formal test suite yet.

Use Playwright mainly for:

- visual verification after UI changes
- checking layout, spacing, typography, and responsiveness
- checking hover states, buttons, modals, navigation, and scroll behavior
- detecting obvious runtime/browser issues
- checking console errors when relevant

### When to use Playwright

After making meaningful UI changes, use Playwright to inspect the affected screen before finishing.

Especially use Playwright when changing:

- layout
- responsive behavior
- navigation
- cards
- lanes
- modals
- hover/focus states
- animations/transitions
- visual hierarchy
- Tailwind/daisyUI styling

### How to use it

The project is configured with Playwright.

Use:

```bash
npx playwright test
```

to run the basic smoke tests.

Use:

```bash
npx playwright test --ui
```

for interactive inspection/debugging when useful.

Use Playwright browser interaction to:
- open the local app
- inspect the rendered UI
- verify layout and responsiveness
- check interactions and runtime behavior

### Testing philosophy for now

Keep tests minimal.

Prefer:
- lightweight smoke tests
- targeted interaction checks
- visual verification

Avoid:
- large formal E2E suites
- excessive test architecture
- overengineering test coverage

The main value right now is giving Claude Code browser visibility during frontend iteration.

### Reporting back

After using Playwright, briefly mention:
- what was checked
- whether it worked
- any issue noticed
- any remaining uncertainty

---

## Code Style

- Use TypeScript everywhere
- Keep functions small and readable
- Use clear and descriptive names
- Avoid deeply nested logic
- Avoid premature generalization

---

## Mock Data Guidelines

- Store mock data in a clear, centralized place (e.g. `src/lib/mock`)
- Use realistic structures (users, items, stats, etc.)
- Keep it simple but believable
- Design it so it can later be replaced by real data sources

---

## What to Avoid

- Overengineering
- Introducing backend concerns
- Complex state management unless necessary
- Abstract patterns without clear benefit
- Large, monolithic components

---

## Key Reminder

This is a **product discovery phase**, not an engineering optimization phase.

The priority is:
- understanding the product
- validating UX decisions
- iterating quickly

NOT:
- perfect architecture
- backend completeness
- production readiness

# Svelte MCP server

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
