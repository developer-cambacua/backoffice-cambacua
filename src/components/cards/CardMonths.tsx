export const CardMonths = ({
  active,
  month,
  year,
  quantityIns,
  quantityOuts,
  iconColor,
}: {
  active: boolean;
  month: string;
  year: string;
  quantityIns: string;
  quantityOuts: string;
  iconColor: string;
}) => {
  return (
    <>
      <div className={`group bg-white cursor-pointer shadow-sm outline ${active ? "outline-secondary-700 outline-2" : "outline-gray-300 outline-1 hover:outline-primary-500"} rounded-md p-4 transition-all`}>
        <div className="flex items-center justify-between gap-x-4">
          <p className="font-semibold">{month}</p>
          <svg
            className={`self-center transition-colors ${active ? "" : "group-hover:text-primary-500"}`}
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm">{year}</p>
        <div className="flex items-center justify-between gap-x-4 my-4">
          <div>
            <p className="text-lg font-bold">{quantityIns}</p>
            <p className="text-sm text-slate-400">Check-ins</p>
          </div>
          <div>
            <p className="text-lg font-bold">{quantityOuts}</p>
            <p className="text-sm text-slate-400">Check-outs</p>
          </div>
        </div>
      </div>
    </>
  );
};
