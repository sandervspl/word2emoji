export const apiConfig = {
  /**
   * Login path of the app
   * Used to redirect for unauthorized calls
   * @see redirectToLogin.js
   */
  loginPath: '/login',

  /**
   * Not found page of the app
   * Used to redirect if the client does not have access rights to the content
   */
  notFoundPath: '/404',
} as const;
