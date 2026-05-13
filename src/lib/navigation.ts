import { goto } from '$app/navigation';

/*
	Card-level click handler used by every item-bearing lane on the homepage.

	Cards contain interactive children (Amplify button, Play overlay, etc.)
	and we don't want clicks on those buttons to also navigate. We check
	`e.target.closest('button, a')` and bail when the click originated inside
	a button or link — those keep their own click semantics. Everything else
	on the card (image, title, metadata, padding) navigates to the detail page.
*/

export function navigateToItem(itemId: string, e: MouseEvent | KeyboardEvent): void {
	const target = e.target as Element | null;
	if (target?.closest('button, a')) return;
	goto(`/items/${itemId}`);
}

/** Keyboard variant used as `onkeydown` so the card row is reachable via tab. */
export function navigateToItemKey(itemId: string, e: KeyboardEvent): void {
	if (e.key !== 'Enter' && e.key !== ' ') return;
	const target = e.target as Element | null;
	if (target?.closest('button, a')) return;
	e.preventDefault();
	goto(`/items/${itemId}`);
}
