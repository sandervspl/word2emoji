import { redirect } from 'next/navigation';

import { apiConfig } from './config';

export const handleStatusCodes = async (code: number | undefined) => {
  switch (code) {
    case 401:
      if (typeof window !== 'undefined') {
        window.location.href = apiConfig.loginPath;
        return;
      }

      return redirect(apiConfig.loginPath);
    case 403:
      if (typeof window !== 'undefined') {
        window.location.href = apiConfig.notFoundPath;
        return;
      }

      return redirect(apiConfig.notFoundPath);
  }

  return;
};

export const getBaseURL = (url: {
  development: string;
  preview: string;
  acceptance: string;
  production: string;
}) => {
  if (__PROD__) {
    return url.production;
  }

  if (__ACC__) {
    return url.acceptance;
  }

  if (__TEST__ || __DEV__) {
    return url.development;
  }

  return url.production;
};
