export const Tooltip = ({ text }: { text: string }) => {
  return (
    <div role="tooltip" className="tooltip">
      <p className="text-inherit whitespace-nowrap">{text}</p>
    </div>
  );
};
