import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (
  number: number | string | null | undefined,
  isPrice = false
): string => {
  if (
    number === null ||
    number === "null" ||
    number === undefined ||
    number === "undefined"
  ) {
    return "";
  }

  if (number == Infinity || number === "Infinity") {
    return "Infinity";
  }

  if (isNaN(number as number) || number === "NaN") {
    return "-";
  }

  let numberAsNumber: string;
  if (typeof number === "number") {
    numberAsNumber = number.toString();
  } else {
    numberAsNumber = number;
  }

  let [integerPart, decimalPart] = numberAsNumber.split(".");

  if (isPrice) {
    const fixed = parseFloat(`0.${decimalPart}`).toFixed(2);
    let [_, fixedDecimalPart] = fixed.toString().split(".");
    decimalPart = fixedDecimalPart;
  } else if (decimalPart && decimalPart.length > 4) {
    const fixed = parseFloat(`0.${decimalPart}`).toFixed(4);
    let [_, fixedDecimalPart] = fixed.toString().split(".");
    decimalPart = fixedDecimalPart;
  }

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
};


/*
 *  Created to match schema.prisma types
 */

export function parseNumbersForSubmit<T extends z.ZodTypeAny>(
  values: string[],
  data: z.infer<T>
) {
  const parsedData = data;
  values.forEach((key: string) => {
    if (typeof parsedData[key] === "number") {
      parsedData[key] = parsedData[key].toString();
    }
  });
  return parsedData;
}

