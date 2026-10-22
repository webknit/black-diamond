export const loadAmplifyRuntimeSecrets = (serializedSecrets = process.env.secrets) => {
	if (!serializedSecrets) {
		return;
	}

	let secrets: unknown;

	try {
		secrets = JSON.parse(serializedSecrets);
	} catch {
		throw new Error('Amplify runtime secrets could not be parsed');
	}

	if (!secrets || typeof secrets !== 'object' || Array.isArray(secrets)) {
		throw new Error('Amplify runtime secrets must be an object');
	}

	for (const [name, value] of Object.entries(secrets)) {
		if (typeof value === 'string') {
			process.env[name] = value;
		}
	}
};
