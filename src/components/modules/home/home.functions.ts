import { createServerFn } from '@tanstack/react-start';

import type { Mode } from 'src/utils/constants';

import { generateEmojis, generateWords, loadHomePageData } from './home.server';

export const getHomePageData = createServerFn({ method: 'GET' })
  .inputValidator((data: { mode: Mode }) => data)
  .handler(async ({ data }) => {
    return loadHomePageData(data.mode);
  });

export const getEmojis = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData');
    }

    return data;
  })
  .handler(async ({ data }) => {
    return generateEmojis(data);
  });

export const getWords = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData');
    }

    return data;
  })
  .handler(async ({ data }) => {
    return generateWords(data);
  });
