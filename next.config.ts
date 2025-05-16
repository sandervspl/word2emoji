import { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: false,
  basePath: '',
  devIndicators: {
    position: 'bottom-left',
  },
  experimental: {
    ppr: 'incremental',
    clientSegmentCache: true,
    dynamicIO: true,
  },
  output: 'standalone',
};

export default config;
