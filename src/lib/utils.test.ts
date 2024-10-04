import { formatNumber } from "./utils";

const arr = [
  [1, "1", "1.00"],
  [12, "12", "12.00"],
  [123, "123", "123.00"],
  [1234, "1 234", "1 234.00"],
  [12345, "12 345", "12 345.00"],
  [123456789, "123 456 789", "123 456 789.00"],

  [-1, "-1", "-1.00"],
  [-12, "-12", "-12.00"],
  [-123, "-123", "-123.00"],
  [-1234, "-1 234", "-1 234.00"],
  [-12345, "-12 345", "-12 345.00"],
  [-123456789, "-123 456 789", "-123 456 789.00"],

  [1.005, "1.005", "1.01"],
  [1.003, "1.003", "1.00"],
  [1.1, "1.1", "1.10"],
  [1.22, "1.22", "1.22"],
  [1.221, "1.221", "1.22"],
  [1.2205, "1.2205", "1.22"],
  [1.123456789, "1.1235", "1.12"],
  [1.127456789, "1.1275", "1.13"],

  [-1.1, "-1.1", "-1.10"],
  [-1.22, "-1.22", "-1.22"],
  [-1.221, "-1.221", "-1.22"],
  [-1.2205, "-1.2205", "-1.22"],
  [-1.123456789, "-1.1235", "-1.12"],
  [-1.127456789, "-1.1275", "-1.13"],

  [1234.2, "1 234.2", "1 234.20"],
  [1234.22, "1 234.22", "1 234.22"],
  [1234.222, "1 234.222", "1 234.22"],
  [1234.2205, "1 234.2205", "1 234.22"],
  [1234.223456789, "1 234.2235", "1 234.22"],
  [1234.227456789, "1 234.2275", "1 234.23"],

  [-1234.2, "-1 234.2", "-1 234.20"],
  [-1234.22, "-1 234.22", "-1 234.22"],
  [-1234.222, "-1 234.222", "-1 234.22"],
  [-1234.2205, "-1 234.2205", "-1 234.22"],
  [-1234.223456789, "-1 234.2235", "-1 234.22"],
  [-1234.227456789, "-1 234.2275", "-1 234.23"],

  [1234567890.003, "1 234 567 890.003", "1 234 567 890.00"],
  [1234567890.005, "1 234 567 890.005", "1 234 567 890.01"],
  [1234567890.007, "1 234 567 890.007", "1 234 567 890.01"],
  [1234567890.2, "1 234 567 890.2", "1 234 567 890.20"],
  [1234567890.22, "1 234 567 890.22", "1 234 567 890.22"],
  [1234567890.222, "1 234 567 890.222", "1 234 567 890.22"],
  [1234567890.2207, "1 234 567 890.2207", "1 234 567 890.22"],
  [1234567890.223456789, "1 234 567 890.2235", "1 234 567 890.22"],
  [1234567890.227456789, "1 234 567 890.2275", "1 234 567 890.23"],

  [-1234567890.2, "-1 234 567 890.2", "-1 234 567 890.20"],
  [-1234567890.22, "-1 234 567 890.22", "-1 234 567 890.22"],
  [-1234567890.222, "-1 234 567 890.222", "-1 234 567 890.22"],
  [-1234567890.2207, "-1 234 567 890.2207", "-1 234 567 890.22"],
  [-1234567890.223456789, "-1 234 567 890.2235", "-1 234 567 890.22"],
  [-1234567890.227456789, "-1 234 567 890.2275", "-1 234 567 890.23"],

  [0, "0", "0.00"],
  
  [0.003, "0.003", "0.00"],
  [0.005, "0.005", "0.01"],
  [0.007, "0.007", "0.01"],
  [0.0003, "0.0003", "0.00"],
  [0.0007, "0.0007", "0.00"],
];

const arr2 = [
  [NaN, "-", "-"],
  [undefined, "", ""],
  [Infinity, "Infinity", "Infinity"],
  [null, "", ""],

  ["NaN", "-", "-"],
  ["undefined", "", ""],
  ["Infinity", "Infinity", "Infinity"],
  ["null", "", ""],

  ['0.0', "0.0", "0.00"],
];

export const testNumberFormatter = () => {
  let errors = 0;

  const check = (
    name: string,
    original: any,
    expected: string,
    isPrice: boolean
  ) => {
    const formatted = formatNumber(original, isPrice);

    if (expected == formatted) {
      // console.log(name, original, "=>", formatted, "'", expected);
    } else {
      console.log(name, original, "=>", formatted, "===", expected);
      errors++;
    }
  };

  arr.forEach((row: any) => {
    check("NUMBER-STR", row[0].toString(), row[1], false);
    check("NUMBER", row[0], row[1], false);
  });
  
  arr2.forEach((row: any) => {
    check("NUMBER", row[0], row[1], false);
  });

  arr.forEach((row: any) => {
    check("PRICE-STR", row[0].toString(), row[2], true);
    check("PRICE", row[0], row[2], true);
  });

  arr2.forEach((row: any) => {
    check("PRICE", row[0], row[2], true);
  });

  console.log("ERRORS NUMBER: ", errors);
};
