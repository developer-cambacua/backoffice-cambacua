import Link from "next/link";
import { TCardArea } from "@/types/cards";

export const CardArea = (card: TCardArea) => {
  return !card.disabled ? (
    <Link
      href={card.link}
      role="button"
      className="flex items-center gap-x-4 box-shadow-3 border-2 border-gray-50 rounded-lg p-6 sm:p-8 h-full hover:border-secondary-600 transition-colors text-secondary-600">
      {card.image()}
      <h5 className="font-bold text-xl text-grisulado-900">{card.title}</h5>
    </Link>
  ) : (
    <button
      type="button"
      disabled
      className="flex items-center gap-x-4 box-shadow-3 border-2 text-gray-400 border-gris-100 rounded-lg p-8 h-full w-full disabled:cursor-not-allowed">
      {card.image()}
      <h5 className="font-bold text-xl">{card.title}</h5>
    </button>
  );
};
