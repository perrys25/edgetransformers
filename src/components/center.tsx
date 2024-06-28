import * as React from "react";
import { PropsWithChildren } from "react";

export default function Center({
  children,
}: PropsWithChildren): React.ReactNode {
  return (
    <div className="flex h-full flex-grow flex-col">
      <div className="mx-auto flex flex-col">{children}</div>
    </div>
  );
}
