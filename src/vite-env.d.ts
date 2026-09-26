/// <reference types="vite/client" />

declare module '*.pdf?inline' {
  const src: string
  export default src
}
