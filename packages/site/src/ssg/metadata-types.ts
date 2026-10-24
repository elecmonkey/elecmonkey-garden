export type MetadataValue = Record<string, unknown>;

export type RobotsValue =
  | string
  | {
      index?: boolean;
      follow?: boolean;
      googleBot?: MetadataValue;
    };

export type SiteMetadata = {
  title?: string | { default?: string; template?: string };
  description?: string;
  keywords?: string | string[];
  authors?: Array<{ name?: string; url?: string }>;
  article?: {
    headline: string;
    publishedTime: string;
    tags: string[];
  };
  creator?: string;
  publisher?: string;
  icons?: string;
  metadataBase?: URL;
  openGraph?: MetadataValue;
  twitter?: MetadataValue;
  robots?: RobotsValue;
};
