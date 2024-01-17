import { O } from 'ts-toolbelt';

type RouteProps = {
  params?: Record<string, string | string[]>;
};

export type NextPageProps<P extends RouteProps = RouteProps> = O.Merge<RouteProps, P> & {
  searchParams?: Record<string, string | string[]>;
};

export type NextLayoutProps<P extends RouteProps = RouteProps> = O.Merge<RouteProps, P> & {
  children?: React.ReactNode;
};

type MetaProps = {
  params?: Record<string, string>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

export type GenerateMetadataProps<T extends MetaProps = MetaProps> = T;
