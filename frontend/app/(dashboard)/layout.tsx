import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 justify-center bg-zinc-50 dark:bg-black">{children}</div>;
}
