/** @type {Select.Option[]} */
export const lifetimeOptions = [
	{
		label: 'Ein Jahr',
		value: 31536000
	},
	{
		label: 'Eine Woche',
		value: 604800
	},
	{
		label: 'Ein Tag',
		value: 86400
	},
	{
		label: 'Eine Stunde',
		value: 3600
	}
];

const allowedLifetimeValues = new Set(lifetimeOptions.map((option) => String(option.value)));

export function isAllowedLifetime(lifetime: string) {
	return allowedLifetimeValues.has(lifetime);
}

export const defaultLifetimeOption = lifetimeOptions[0];
