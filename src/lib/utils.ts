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
    const fixed = parseFloat(`0.${decimalPart || "0"}`).toFixed(2);
    let [_, fixedDecimalPart] = fixed.toString().split(".");
    decimalPart = fixedDecimalPart;
  } else {
    if (!decimalPart) {
      // If there's no decimal part, add ".0"
      decimalPart = "0";
    } else {
      // Remove trailing zeros and ensure at least one digit
      decimalPart = decimalPart.replace(/0+$/, "") || "0";

      if (decimalPart.length > 4) {
        // If decimal part is longer than 4 digits, round it
        const fixed = parseFloat(`0.${decimalPart}`).toFixed(4);
        let [_, fixedDecimalPart] = fixed.toString().split(".");
        decimalPart = fixedDecimalPart;
      }
    }
  }

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${integerPart}.${decimalPart}`;
};

/*
 *  Created to match schema.prisma types
 */

export function parseNumbersForSubmit<T extends z.ZodTypeAny>(
  values: string[],
  data: z.infer<T>
) {
  const parsedData = data;
  values.forEach((value: string) => {
    const [key, secondKey] = value.split(".");

    if (key === "line_items" && secondKey) {
      parsedData[key].forEach((item: any, index: number) => {
        if (typeof item[secondKey] === "number") {
          parsedData[key][index][secondKey] = item[secondKey].toString();
        }
      });
    } else if (typeof parsedData[key] === "number") {
      parsedData[key] = parsedData[key].toString();
    }
  });
  return parsedData;
}

export const splitCustomerName = (fullName) => {
  const name = fullName.toUpperCase();
  let name1 = "";
  let name2 = "";
  let name3 = "";

  // Split the full name into words
  const words = name.split(" ");

  // Build name1 (first 50 chars)
  let currentLength = 0;
  let wordIndex = 0;

  // Build name1
  while (wordIndex < words.length) {
    const word = words[wordIndex];
    const wordWithSpace = wordIndex > 0 ? " " + word : word;

    if (currentLength + wordWithSpace.length <= 50) {
      name1 += wordWithSpace;
      currentLength += wordWithSpace.length;
      wordIndex++;
    } else {
      break;
    }
  }

  // Build name2 (next 50 chars)
  if (wordIndex < words.length) {
    currentLength = 0;
    const startIndex = wordIndex;

    while (wordIndex < words.length) {
      const word = words[wordIndex];
      const wordWithSpace = wordIndex > startIndex ? " " + word : word;

      if (currentLength + wordWithSpace.length <= 50) {
        name2 += wordWithSpace;
        currentLength += wordWithSpace.length;
        wordIndex++;
      } else {
        break;
      }
    }
  }

  // Build name3 (remaining words)
  if (wordIndex < words.length) {
    name3 = words.slice(wordIndex).join(" ");
  }

  return { name1, name2, name3 };
};
