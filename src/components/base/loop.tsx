import { cloneElement, ReactNode } from "react";

type LoopProps = {
  amount: number;
  children: ReactNode;
};

export function Loop({ amount, children }: LoopProps) {
  const components = Array.from(Array(amount).keys()).map((key) =>
    cloneElement(children as JSX.Element, { key })
  );

  return <>{components}</>;
}
