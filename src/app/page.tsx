import * as i from 'types';
import * as React from 'react';
import { Metadata } from 'next';

type Props = i.NextPageProps;

export const metadata: Metadata = {
  title: 'Home',
};

const Page: React.FC<Props> = async () => {
  return <main></main>;
};

export default Page;
