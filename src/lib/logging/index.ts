import { dev } from '$app/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFields = Record<string, unknown>;

interface LogOptions {
	context?: string;
	error?: unknown;
	fields?: LogFields;
	level?: LogLevel;
}

function getErrorFields(error: unknown): LogFields {
	if (error instanceof Error) {
		return {
			error_message: error.message,
			error_type: error.name,
			stack: error.stack
		};
	}

	return {
		error_message: typeof error === 'string' ? error : 'Unknown error'
	};
}

export function log(message: string, options: LogOptions = {}) {
	const { context, error, fields = {}, level = 'info' } = options;
	const entry = {
		...fields,
		...(error === undefined ? {} : getErrorFields(error)),
		context,
		environment: dev ? 'development' : 'production',
		level,
		message,
		service: 'potber-auth',
		timestamp: new Date().toISOString()
	};
	const output = JSON.stringify(entry);

	switch (level) {
		case 'debug':
			console.debug(output);
			break;
		case 'error':
			console.error(output);
			break;
		case 'warn':
			console.warn(output);
			break;
		default:
			console.info(output);
	}
}
