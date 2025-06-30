export const Counter = ({
  counter,
  setCounter,
  hasError,
  maxValue,
}: {
  counter: number;
  setCounter: any;
  hasError?: boolean;
  maxValue: number;
}) => {
  const handleDecrement = () => {
    if (counter > 0) {
      setCounter(counter - 1);
    }
  };

  const handleIncrement = () => {
    if (counter < maxValue) {
      setCounter(counter + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={counter <= 0}
        className="enabled:bg-secondary-400 disabled:bg-gray-400 rounded-full text-white font-bold min-h-[32px] min-w-[32px] disabled:cursor-not-allowed"
        onClick={handleDecrement}>
        -
      </button>
      <span
        className={`min-w-[2rem] text-center ${
          hasError ? "text-red-500" : ""
        }`}>
        {counter}
      </span>
      <button
        className="enabled:bg-secondary-400 disabled:bg-gray-400 rounded-full text-white font-bold min-h-[32px] min-w-[32px] disabled:cursor-not-allowed"
        onClick={handleIncrement}
        disabled={counter >= maxValue}>
        +
      </button>
    </div>
  );
};
