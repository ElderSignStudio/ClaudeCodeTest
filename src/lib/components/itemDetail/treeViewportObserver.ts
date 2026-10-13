/*
	Tree-viewport observer — a single module-level IntersectionObserver
	shared across every mounted PropagationNode. Each expanded node
	registers its CHILDREN CONTAINER (the `overflow-clip` div that
	holds its child nodes). When that container scrolls outside the
	viewport (plus a 200px hysteresis margin so approaching content
	resumes well before it's visible), we add `.tree-conduits-paused`
	to the container. CSS rules under that class (see app.css) pause
	the conduit animations of the container's DIRECT children via
	`animation-play-state: paused`, which is the cheapest possible way
	to stop the browser doing per-frame work for hundreds of
	off-screen helix / trail / head particles.

	Why the children container and not the node's own wrapper:
	  ─ A child's particles do not stay inside the child's wrapper.
	    They travel UP the rail from the child's row to the parent's
	    avatar, passing through every sibling subtree above them —
	    in Riku's expanded tree that can be ~10 000 px of travel.
	    The parent's children container is exactly the box that
	    clips that travel (its overflow-clip is the particles'
	    spatial death plane), so "container intersects viewport" is
	    the correct question. Observing the child's wrapper paused
	    particles that were still visibly mid-flight far above it.
	  ─ Scoping the CSS to direct children (`>`) means each container
	    only controls its own conduits; nested containers decide for
	    their own children independently.

	Why a module singleton instead of a per-tree observer:
	  ─ Riku's tree mounts hundreds of PropagationNodes. One shared
	    IO with N observed targets is far cheaper than N IOs.
	  ─ The default root (viewport) is the correct frame of reference
	    for every tree on the page.

	Returns an unsubscribe function so callers can clean up in their
	own $effect teardown.
*/

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
	if (typeof IntersectionObserver === 'undefined') return null;
	if (observer) return observer;
	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				/* `.toggle(class, force)` — force=true adds, false removes.
				   `!isIntersecting` means "outside viewport → paused". */
				entry.target.classList.toggle('tree-conduits-paused', !entry.isIntersecting);
			}
		},
		{
			/* 200 px hysteresis on both sides keeps approaching nodes
			   resumed well before they enter the visible area, so the
			   user never sees a particle "wake up" frame inside their
			   field of view. Costs essentially nothing: the IO is still
			   only firing when nodes cross this expanded boundary. */
			rootMargin: '200px 0px',
			threshold: 0,
		},
	);
	return observer;
}

export function observeConduitsForPause(el: HTMLElement): () => void {
	const obs = getObserver();
	if (!obs) return () => {};
	obs.observe(el);
	return () => obs.unobserve(el);
}
