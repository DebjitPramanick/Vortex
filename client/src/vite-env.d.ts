/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.svg" {
  import type { FunctionComponent, SVGProps } from "react";

  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module "@icons/*.svg" {
  import type { FunctionComponent, SVGProps } from "react";

  const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GEONAMES_USERNAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
