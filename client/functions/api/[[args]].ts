interface Env {
	REMOTE_API_URL: string
}

export const onRequest: PagesFunction<Env> = async (c) => {
	const newUrl = c.env.REMOTE_API_URL
	const r = c.request as Request
	const url = r.url.replace(/.*api\//, newUrl + '/')

	return fetch(url, r)
}
