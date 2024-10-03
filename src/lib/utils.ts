import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatPrice = (number: number | string | null | undefined) => {
  if(isNaN(number as number)) {
    return '-';
  }
  return new Intl.NumberFormat('pl-PL', {minimumFractionDigits: 2}).format(number as number);
}

export const formatThousands = (number: number | string | null | undefined) => {
  if(number) {
    if(isNaN(number as number)) {
      return "-";
    }
    const [integerPart, decimalPart] = number.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }
  return '';
}