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

For each task:

### Before coding
- Explain your plan briefly
- List which files you will create or modify
- Highlight any important decisions

### After coding
- Explain what you implemented
- Explain why you structured it this way
- Point out anything that deserves attention or review

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