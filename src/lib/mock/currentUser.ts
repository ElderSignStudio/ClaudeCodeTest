// The current (mock) user. Used for avatars, display names, and any
// UI that shows "you" — Header, Sidebar, etc.
// Replace with a real auth session when the backend is added.
import { avatarFor } from './scoutAvatars';

export const currentUser = {
	name: 'Dan',
	avatarUrl: avatarFor('dan', 'DanOuter'),
};
