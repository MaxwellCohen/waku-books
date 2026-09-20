declare module '*.css';

interface ImportMetaEnv {
  readonly CLOUDFLARE?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
