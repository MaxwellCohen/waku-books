declare module '*.css';

interface ImportMetaEnv {
  readonly CLOUDFLARE?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*?inline' {
  const css: string;
  export default css;
}
declare module '*?url' {
  const url: string;
  export default url;
}
declare module '*&as=srcset' {
  const srcset: string;
  export default srcset;
}
declare module '*&format=webp' {
  const src: string;
  export default src;
}
declare module '*&format=avif' {
  const src: string;
  export default src;
}
