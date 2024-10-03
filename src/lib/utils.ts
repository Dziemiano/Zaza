import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatThousands = (number: number | string | null | undefined) => {
  if (isNaN(number as number)) {
    return "-";
  }
  if (number) {
    const [integerPart, decimalPart] = number.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  }
  return "";
};

export const formatPrice = (number: number | string | null | undefined) => {
  let price = number;
  if (typeof price === "string") {
    price = parseFloat(price).toFixed(2);
  }
  return formatThousands(price);
};
