const DEFAULT_PORTS = {
	http: '80',
	https: '443'
} as const;

function safeParseUrl(uri: string): URL | null {
	try {
		return new URL(uri);
	} catch {
		return null;
	}
}

function getNormalizedPort(url: URL): string {
	if (url.port) {
		return url.port;
	}

	return DEFAULT_PORTS[url.protocol.replace(':', '') as keyof typeof DEFAULT_PORTS] ?? '';
}

function matchesWildcardHostname(hostname: string, wildcardSuffix: string): boolean {
	const normalizedHostname = hostname.toLowerCase();
	const normalizedSuffix = wildcardSuffix.toLowerCase();

	if (!normalizedHostname.endsWith(`.${normalizedSuffix}`)) {
		return false;
	}

	const label = normalizedHostname.slice(
		0,
		normalizedHostname.length - normalizedSuffix.length - 1
	);

	return label.length > 0 && !label.includes('.');
}

export function isAllowedRedirectUri(allowedUri: string, requestedUri: string): boolean {
	const allowed = safeParseUrl(allowedUri);
	const requested = safeParseUrl(decodeURIComponent(requestedUri));

	if (!allowed || !requested) {
		return false;
	}

	if (
		allowed.protocol !== requested.protocol ||
		getNormalizedPort(allowed) !== getNormalizedPort(requested) ||
		allowed.pathname !== requested.pathname ||
		allowed.search !== requested.search ||
		allowed.hash !== requested.hash
	) {
		return false;
	}

	if (allowed.hostname.startsWith('*.')) {
		return matchesWildcardHostname(requested.hostname, allowed.hostname.slice(2));
	}

	return allowed.hostname === requested.hostname;
}
