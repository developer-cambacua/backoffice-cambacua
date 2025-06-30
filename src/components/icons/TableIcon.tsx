interface IClassName {
  classNames?: string;
}

export const TableIcon = ({
  children,
  classNames,
  ...props
}: React.PropsWithChildren &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  IClassName) => {
  return (
    <button
      className={`${classNames} transition-colors bg-transparent text-inherit min-w-[32px] min-h-[32px] p-2 rounded-full flex items-center justify-center`}
      {...props}>
      {children}
    </button>
  );
};
