const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `pkl_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

export function getAppParams() {
	try {
		let appIdFromQuery = null;
		if (!isNode) {
			const url = new URL(window.location.href);
			appIdFromQuery = url.searchParams.get('appId');
		}

		const appIdFromEnv = import.meta.env.VITE_APP_ID || import.meta.env.VITE_PKL_APP_ID;

		if (getAppParamValue('clear_access_token') === 'true') {
			storage.removeItem('pkl_access_token');
			storage.removeItem('token');
		}

		const appIdFromExistingParam = getAppParamValue('app_id', { defaultValue: appIdFromEnv });
		const appId = appIdFromQuery || appIdFromExistingParam || appIdFromEnv;

		if (!appId) {
			console.warn('appId not found in URL or ENV');
		}

		return {
			appId: appId || null,
			token: getAppParamValue('access_token', { removeFromUrl: true }),
			fromUrl: getAppParamValue('from_url', { defaultValue: isNode ? '' : window.location.href }),
			functionsVersion: getAppParamValue('functions_version', { defaultValue: import.meta.env.VITE_PKL_FUNCTIONS_VERSION }),
			appBaseUrl: getAppParamValue('app_base_url', { defaultValue: import.meta.env.VITE_PKL_APP_BASE_URL }),
		}
	} catch (error) {
		console.error('Error getting app params:', error);
		return {
			appId: null,
			token: null,
			fromUrl: isNode ? '' : window.location.href,
			functionsVersion: import.meta.env.VITE_PKL_FUNCTIONS_VERSION || null,
			appBaseUrl: import.meta.env.VITE_PKL_APP_BASE_URL || null,
		}
	}
}


export const appParams = {
	...getAppParams()
}