interface ContainerProps extends React.PropsWithChildren {
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = "py-8 px-6",
}) => {
  return <div className={`${className}`}>{children}</div>;
};
