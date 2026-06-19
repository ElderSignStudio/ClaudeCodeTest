import { getUserDetail } from '$lib/mock/users';

/*
	User Detail load function.

	Resolves the route id against the mock-user table; unknown ids
	fall through to a synthesised "scout in progress" profile so the
	page never 404s — see `getUserDetail` for the fallback path.
*/

export const load = ({ params }) => {
	return { user: getUserDetail(params.id) };
};
