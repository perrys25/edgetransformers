import * as React from "react";
import { PropsWithChildren } from "react";

export default function Center({
  children,
}: PropsWithChildren): React.ReactNode {
  return (
    <div className="flex h-full flex-grow flex-col">
      <div className="flex-grow" />
      <div className="mx-auto">{children}</div>
      <div className="flex-grow" />
    </div>
  );
}
