interface ICardData {
  title: string;
  classNames?: string;
  padding?: string;
  camposObligatorios?: boolean;
}

export const CardData = ({
  children,
  title,
  camposObligatorios,
  classNames = "",
  padding = "px-8 py-6",
}: React.PropsWithChildren<ICardData>) => {
  return (
    <div
      className={`${classNames} border-2 border-gris-50 bg-white rounded-md`}>
      <div className="bg-terciary-100 py-4 px-8">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <h2 className="font-semibold">{title}</h2>
          {camposObligatorios && (
            <p className="text-secondary-950 font-light text-sm">
              * Campos obligatorios
            </p>
          )}
        </div>
      </div>
      <div className={padding}>{children}</div>
    </div>
  );
};
