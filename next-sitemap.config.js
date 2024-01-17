// @ts-check
// https://www.npmjs.com/package/next-sitemap#configuration-options

/** @type {string | undefined} */
const SITE_URL = {
  development: process.env.TEST_SITE_URL,
  acceptance: process.env.ACC_SITE_URL,
  production: process.env.PROD_SITE_URL,
}[process.env.APP_ENV];

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
};

module.exports = config;
