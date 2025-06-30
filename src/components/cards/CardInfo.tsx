interface ICardInfo {
  title: string;
  quantity: string | number;
  percentage?: number | undefined;
  shadow?: boolean;
}

export const CardInfo = ({ title, quantity, percentage, shadow }: ICardInfo) => {
  return (
    <div className={`bg-white outline-1 outline-gray-300 outline p-6 rounded-lg space-y-2 ${shadow ? "shadow-md" : ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {percentage !== undefined && (
          <div
            className={`flex items-center gap-x-2 px-4 py-0.5 rounded-md text-white capitalize ${
              percentage > 0
                ? "bg-green-600"
                : percentage < 0
                ? "bg-red-400"
                : "bg-gray-400"
            }`}>
            {percentage > 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
                className="size-6">
                <path d="m136-240-56-56 296-298 160 160 208-206H640v-80h240v240h-80v-104L536-320 376-480 136-240Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
                className="size-6">
                <path d="M640-240v-80h104L536-526 376-366 80-664l56-56 240 240 160-160 264 264v-104h80v240H640Z" />
              </svg>
            )}{" "}
            %{percentage}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold">{quantity}</p>
    </div>
  );
};
