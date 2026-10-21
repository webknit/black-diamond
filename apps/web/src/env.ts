import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	MONGODB_URI: {
		description: 'MongoDB connection string for server-side data access'
	},
	MONGODB_DATABASE: {
		description: 'MongoDB database name for server-side data access'
	}
});
