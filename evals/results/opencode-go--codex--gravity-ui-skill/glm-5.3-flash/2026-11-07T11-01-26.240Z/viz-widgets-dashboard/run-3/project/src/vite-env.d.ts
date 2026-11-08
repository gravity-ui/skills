/// <reference types="vite/client" />

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}
