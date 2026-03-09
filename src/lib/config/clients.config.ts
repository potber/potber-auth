export const clients: App.Client[] = [
	{
		name: 'potber',
		id: '45a14ddc-e3d3-4b5b-a45a-a04946974adc',
		allowedRedirectUris: [
			'http://localhost:4200/auth/callback',
			'http://schleppi.fritz.box:4200/auth/callback',
			'https://test.potber.de/auth/callback',
			'https://potber.de/auth/callback',
			'https://www.potber.de/auth/callback'
		]
	},
	{
		name: 'potber-preview',
		id: '1af5d165-2357-4bae-817d-a1d7f471ef67',
		allowedRedirectUris: [
			'http://localhost:4200/auth/callback',
			'https://*.potber.kristofdreier.de/auth/callback',
			'https://*.preview.potber.de/auth/callback'
		]
	},
	{
		name: 'mpe',
		id: '2e216203-936a-4a75-94ea-307ab1ceb5f6',
		allowedRedirectUris: [
			'http://localhost:5000/auth',
			'https://www.mods-mpe.de/auth',
			'https://mods-mpe.de/auth'
		]
	},
	{
		name: 'bbdb',
		id: 'b2c97fa9-3f0e-482f-bd9f-4dd9ad746a68',
		allowedRedirectUris: ['http://localhost:8000/auth', 'https://bbdb.jomx.net/auth']
	},
	{
		name: 'imgpot',
		id: '1b59979e-e95f-4402-85e6-7c0ac509f1c7',
		allowedRedirectUris: ['http://localhost:3000/auth/callback', 'https://imgpot.de/auth/callback']
	}
];
