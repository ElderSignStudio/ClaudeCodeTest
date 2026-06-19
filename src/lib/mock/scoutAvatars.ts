/*
	Scout-portrait mapping.

	Real AI-generated portraits live in `static/avatars/scouts/`. The
	filenames are inconsistent (`uifaces-human-avatar (N).jpg` etc.),
	so this module maintains a STABLE explicit mapping from each
	known scout id to a chosen file. Unmapped ids fall through to
	the existing dicebear generator so any procedurally-created
	scout still gets a deterministic avatar without code changes.

	Assignment policy:

	  - Portraits are assigned ARBITRARILY but CONSISTENTLY. Once a
	    scout id is in the map, it should keep the same file forever
	    so screenshots and demos don't suddenly shuffle faces.
	  - The mapping does NOT try to infer identity from filenames.
	    Editing this file is the way to swap a portrait, not renaming
	    the file under `static/`.
	  - The full list of available files is captured in
	    `ALL_PORTRAIT_FILES` below so a future audit can compare
	    "files present" vs. "ids mapped".

	Used by: `users.ts`, `userSignalTree.ts`, `propagation.ts`. Call
	`avatarFor(id, fallbackSeed?)` instead of `dicebear(seed)` so the
	portrait wins when one is available and the dicebear seed is
	preserved as a stable fallback otherwise.
*/

/** Mapped scouts. Add a row here to assign a new portrait. Files
 *  live in `static/avatars/scouts/` and the path here is the URL
 *  the browser sees (SvelteKit serves `static/` at `/`). */
export const scoutAvatarById: Record<string, string> = {
	alice:  '/avatars/scouts/uifaces-human-avatar (1).jpg',
	bo:     '/avatars/scouts/uifaces-human-avatar (2).jpg',
	dan:    '/avatars/scouts/uifaces-human-avatar (3).jpg',
	daria:  '/avatars/scouts/uifaces-human-avatar (4).jpg',
	doro:   '/avatars/scouts/uifaces-human-avatar (5).jpg',
	gisli:  '/avatars/scouts/uifaces-human-avatar (6).jpg',
	hana:   '/avatars/scouts/uifaces-human-avatar (7).jpg',
	hilde:  '/avatars/scouts/uifaces-human-avatar (8).jpg',
	ines:   '/avatars/scouts/uifaces-human-avatar (9).jpg',
	jaakko: '/avatars/scouts/uifaces-human-avatar (10).jpg',
	kai:    '/avatars/scouts/uifaces-human-avatar (11).jpg',
	kalla:  '/avatars/scouts/uifaces-human-avatar (12).jpg',
	leo:    '/avatars/scouts/uifaces-human-avatar (13).jpg',
	lia:    '/avatars/scouts/uifaces-human-avatar (14).jpg',
	magnus: '/avatars/scouts/uifaces-human-avatar (15).jpg',
	marco:  '/avatars/scouts/uifaces-human-avatar (16).jpg',
	niko:   '/avatars/scouts/uifaces-human-avatar (17).jpg',
	olek:   '/avatars/scouts/uifaces-human-avatar (18).jpg',
	otto:   '/avatars/scouts/uifaces-human-avatar (19).jpg',
	pauli:  '/avatars/scouts/uifaces-human-avatar (20).jpg',
	renan:  '/avatars/scouts/uifaces-human-avatar (21).jpg',
	riku:   '/avatars/scouts/uifaces-human-avatar (22).jpg',
	saga:   '/avatars/scouts/uifaces-human-avatar (23).jpg',
	sanna:  '/avatars/scouts/uifaces-human-avatar (24).jpg',
	sanne:  '/avatars/scouts/uifaces-human-avatar (25).jpg',
	tobias: '/avatars/scouts/uifaces-human-avatar (26).jpg',
	vera:   '/avatars/scouts/uifaces-human-avatar (27).jpg',
	yana:   '/avatars/scouts/uifaces-human-avatar (28).jpg',
	yuki:   '/avatars/scouts/uifaces-human-avatar (29).jpg',
};

const DICEBEAR_BASE = 'https://api.dicebear.com/9.x/thumbs/svg';

/** Resolve an avatar URL for a scout. If the id has a manual
 *  portrait mapping, returns the portrait URL. Otherwise falls back
 *  to dicebear with the supplied seed (defaults to the id itself,
 *  which keeps unmapped scouts visually stable across reloads). */
export function avatarFor(id: string, fallbackSeed?: string): string {
	const portrait = scoutAvatarById[id];
	if (portrait) return portrait;
	const seed = fallbackSeed ?? id;
	return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}&backgroundColor=1e1b4b`;
}

/** Convenience predicate — useful for audits ("which scouts still
 *  use generated avatars?") without re-computing the same lookup. */
export function hasPortrait(id: string): boolean {
	return Object.prototype.hasOwnProperty.call(scoutAvatarById, id);
}

/* ── Available files (informational) ──────────────────────────
   Snapshot of what's in `static/avatars/scouts/` at the time of
   writing. Used by audit scripts only; runtime never consults
   this list. Update when new portraits land. */
export const ALL_PORTRAIT_FILES: readonly string[] = [
	'uifaces-abstract-avatar (1).jpg',
	'uifaces-abstract-avatar (2).jpg',
	'uifaces-abstract-avatar.jpg',
	'uifaces-alien-avatar (1).jpg',
	'uifaces-alien-avatar (2).jpg',
	'uifaces-alien-avatar (3).jpg',
	'uifaces-alien-avatar (4).jpg',
	'uifaces-alien-avatar (5).jpg',
	'uifaces-alien-avatar.jpg',
	'uifaces-cartoon-avatar (1).jpg',
	'uifaces-cartoon-avatar (2).jpg',
	'uifaces-cartoon-avatar (3).jpg',
	'uifaces-cartoon-avatar (4).jpg',
	'uifaces-cartoon-avatar (5).jpg',
	'uifaces-cartoon-avatar (6).jpg',
	'uifaces-cartoon-avatar (7).jpg',
	'uifaces-cartoon-avatar (8).jpg',
	'uifaces-cartoon-avatar.jpg',
	'uifaces-human-avatar (1).jpg',
	'uifaces-human-avatar (2).jpg',
	'uifaces-human-avatar (3).jpg',
	'uifaces-human-avatar (4).jpg',
	'uifaces-human-avatar (5).jpg',
	'uifaces-human-avatar (6).jpg',
	'uifaces-human-avatar (7).jpg',
	'uifaces-human-avatar (8).jpg',
	'uifaces-human-avatar (9).jpg',
	'uifaces-human-avatar (10).jpg',
	'uifaces-human-avatar (11).jpg',
	'uifaces-human-avatar (12).jpg',
	'uifaces-human-avatar (13).jpg',
	'uifaces-human-avatar (14).jpg',
	'uifaces-human-avatar (15).jpg',
	'uifaces-human-avatar (16).jpg',
	'uifaces-human-avatar (17).jpg',
	'uifaces-human-avatar (18).jpg',
	'uifaces-human-avatar (19).jpg',
	'uifaces-human-avatar (20).jpg',
	'uifaces-human-avatar (21).jpg',
	'uifaces-human-avatar (22).jpg',
	'uifaces-human-avatar (23).jpg',
	'uifaces-human-avatar (24).jpg',
	'uifaces-human-avatar (25).jpg',
	'uifaces-human-avatar (26).jpg',
	'uifaces-human-avatar (27).jpg',
	'uifaces-human-avatar (28).jpg',
	'uifaces-human-avatar (29).jpg',
	'uifaces-human-avatar (30).jpg',
	'uifaces-human-avatar (31).jpg',
	'uifaces-human-avatar (32).jpg',
	'uifaces-human-avatar (33).jpg',
	'uifaces-human-avatar (34).jpg',
	'uifaces-human-avatar (35).jpg',
	'uifaces-human-avatar (36).jpg',
	'uifaces-human-avatar (37).jpg',
	'uifaces-human-avatar (38).jpg',
	'uifaces-human-avatar (39).jpg',
	'uifaces-human-avatar (40).jpg',
	'uifaces-human-avatar (41).jpg',
	'uifaces-human-avatar (42).jpg',
	'uifaces-human-avatar (43).jpg',
	'uifaces-human-avatar (44).jpg',
	'uifaces-human-avatar (45).jpg',
	'uifaces-human-avatar (46).jpg',
	'uifaces-human-avatar (47).jpg',
	'uifaces-human-avatar (48).jpg',
	'uifaces-human-avatar (49).jpg',
	'uifaces-human-avatar (50).jpg',
	'uifaces-human-avatar.jpg',
];
