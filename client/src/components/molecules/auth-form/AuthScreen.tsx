import type { ReactNode } from "react";

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-vortex-bg px-4 py-10">
      <div className="w-full max-w-[22.5rem]">{children}</div>
    </div>
  );
}
