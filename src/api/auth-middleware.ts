import { fetchAuthSession } from 'aws-amplify/auth';
import type { Middleware } from 'openapi-fetch';

export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const accessToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return request;
  },
};
