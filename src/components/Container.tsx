import type { FC, ReactNode } from "react";

type Props = {
  children: ReactNode;
  classNames?: string;
};

export const Container: FC<Props> = ({ children, classNames = "" }) => {
  return (
    <div className={`m-auto max-w-xl bg-slate-200 ${classNames}`}>
      {children}
    </div>
  );
};
