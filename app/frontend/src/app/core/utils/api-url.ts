import { environment } from '../../../environments/environment';

/**
 * Base URL for API requests. Uses the current origin when in browser
 * so requests always go to the same host/port as the page (avoids
 * ERR_CONNECTION_REFUSED when origin differs from expected).
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin + '/api';
  }
  const url = environment.apiUrl ?? '';
  if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return '/api';
}
