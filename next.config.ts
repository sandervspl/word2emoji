import { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: false,
  basePath: '',
  devIndicators: {
    position: 'bottom-left',
  },
  cacheComponents: true,
  output: 'standalone',
};

export default config;
