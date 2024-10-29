import { formatNumber } from "./utils";

// const arr = [
//   [1, "1", "1.00"],
//   [12, "12", "12.00"],
//   [123, "123", "123.00"],
//   [1234, "1 234", "1 234.00"],
//   [12345, "12 345", "12 345.00"],
//   [123456789, "123 456 789", "123 456 789.00"],

//   [-1, "-1", "-1.00"],
//   [-12, "-12", "-12.00"],
//   [-123, "-123", "-123.00"],
//   [-1234, "-1 234", "-1 234.00"],
//   [-12345, "-12 345", "-12 345.00"],
//   [-123456789, "-123 456 789", "-123 456 789.00"],

//   [1.005, "1.005", "1.01"],
//   [1.003, "1.003", "1.00"],
//   [1.1, "1.1", "1.10"],
//   [1.22, "1.22", "1.22"],
//   [1.221, "1.221", "1.22"],
//   [1.2205, "1.2205", "1.22"],
//   [1.123456789, "1.1235", "1.12"],
//   [1.127456789, "1.1275", "1.13"],

//   [-1.1, "-1.1", "-1.10"],
//   [-1.22, "-1.22", "-1.22"],
//   [-1.221, "-1.221", "-1.22"],
//   [-1.2205, "-1.2205", "-1.22"],
//   [-1.123456789, "-1.1235", "-1.12"],
//   [-1.127456789, "-1.1275", "-1.13"],

//   [1234.2, "1 234.2", "1 234.20"],
//   [1234.22, "1 234.22", "1 234.22"],
//   [1234.222, "1 234.222", "1 234.22"],
//   [1234.2205, "1 234.2205", "1 234.22"],
//   [1234.223456789, "1 234.2235", "1 234.22"],
//   [1234.227456789, "1 234.2275", "1 234.23"],

//   [-1234.2, "-1 234.2", "-1 234.20"],
//   [-1234.22, "-1 234.22", "-1 234.22"],
//   [-1234.222, "-1 234.222", "-1 234.22"],
//   [-1234.2205, "-1 234.2205", "-1 234.22"],
//   [-1234.223456789, "-1 234.2235", "-1 234.22"],
//   [-1234.227456789, "-1 234.2275", "-1 234.23"],

//   [1234567890.003, "1 234 567 890.003", "1 234 567 890.00"],
//   [1234567890.005, "1 234 567 890.005", "1 234 567 890.01"],
//   [1234567890.007, "1 234 567 890.007", "1 234 567 890.01"],
//   [1234567890.2, "1 234 567 890.2", "1 234 567 890.20"],
//   [1234567890.22, "1 234 567 890.22", "1 234 567 890.22"],
//   [1234567890.222, "1 234 567 890.222", "1 234 567 890.22"],
//   [1234567890.2207, "1 234 567 890.2207", "1 234 567 890.22"],
//   [1234567890.223456789, "1 234 567 890.2235", "1 234 567 890.22"],
//   [1234567890.227456789, "1 234 567 890.2275", "1 234 567 890.23"],

//   [-1234567890.2, "-1 234 567 890.2", "-1 234 567 890.20"],
//   [-1234567890.22, "-1 234 567 890.22", "-1 234 567 890.22"],
//   [-1234567890.222, "-1 234 567 890.222", "-1 234 567 890.22"],
//   [-1234567890.2207, "-1 234 567 890.2207", "-1 234 567 890.22"],
//   [-1234567890.223456789, "-1 234 567 890.2235", "-1 234 567 890.22"],
//   [-1234567890.227456789, "-1 234 567 890.2275", "-1 234 567 890.23"],

//   [0, "0", "0.00"],

//   [0.003, "0.003", "0.00"],
//   [0.005, "0.005", "0.01"],
//   [0.007, "0.007", "0.01"],
//   [0.0003, "0.0003", "0.00"],
//   [0.0007, "0.0007", "0.00"],
// ];

// const arr2 = [
//   [NaN, "-", "-"],
//   [undefined, "", ""],
//   [Infinity, "Infinity", "Infinity"],
//   [null, "", ""],

//   ["NaN", "-", "-"],
//   ["undefined", "", ""],
//   ["Infinity", "Infinity", "Infinity"],
//   ["null", "", ""],

//   ["0.0", "0.0", "0.00"],
// ];

// export const testNumberFormatter = () => {
//   let errors = 0;

//   const check = (
//     name: string,
//     original: any,
//     expected: string,
//     isPrice: boolean
//   ) => {
//     const formatted = formatNumber(original, isPrice);

//     if (expected == formatted) {
//       // console.log(name, original, "=>", formatted, "'", expected);
//     } else {
//       console.log(name, original, "=>", formatted, "===", expected);
//       errors++;
//     }
//   };

//   arr.forEach((row: any) => {
//     check("NUMBER-STR", row[0].toString(), row[1], false);
//     check("NUMBER", row[0], row[1], false);
//   });

//   arr2.forEach((row: any) => {
//     check("NUMBER", row[0], row[1], false);
//   });

//   arr.forEach((row: any) => {
//     check("PRICE-STR", row[0].toString(), row[2], true);
//     check("PRICE", row[0], row[2], true);
//   });

//   arr2.forEach((row: any) => {
//     check("PRICE", row[0], row[2], true);
//   });

//   console.log("ERRORS NUMBER: ", errors);
// };

describe("formatNumber", () => {
  // Test null/undefined handling
  describe("null and undefined handling", () => {
    test("should return empty string for null", () => {
      expect(formatNumber(null)).toBe("");
    });

    test('should return empty string for "null" string', () => {
      expect(formatNumber("null")).toBe("");
    });

    test("should return empty string for undefined", () => {
      expect(formatNumber(undefined)).toBe("");
    });

    test('should return empty string for "undefined" string', () => {
      expect(formatNumber("undefined")).toBe("");
    });
  });

  // Test special number handling
  describe("special number handling", () => {
    test('should return "Infinity" for Infinity', () => {
      expect(formatNumber(Infinity)).toBe("Infinity");
    });

    test('should return "Infinity" for "Infinity" string', () => {
      expect(formatNumber("Infinity")).toBe("Infinity");
    });

    test('should return "-" for NaN', () => {
      expect(formatNumber(NaN)).toBe("-");
    });

    test('should return "-" for "NaN" string', () => {
      expect(formatNumber("NaN")).toBe("-");
    });
  });

  // Test integer formatting (non-price mode)
  describe("integer formatting (non-price mode)", () => {
    test("should format simple integer with .0", () => {
      expect(formatNumber(20)).toBe("20.0");
    });

    test("should format large integer with spaces and .0", () => {
      expect(formatNumber(1000000)).toBe("1 000 000.0");
    });

    test("should format negative integer with .0", () => {
      expect(formatNumber(-42)).toBe("-42.0");
    });

    test("should format zero with .0", () => {
      expect(formatNumber(0)).toBe("0.0");
    });
  });

  // Test decimal number formatting (non-price mode)
  describe("decimal number formatting (non-price mode)", () => {
    test("should preserve single decimal place", () => {
      expect(formatNumber(20.5)).toBe("20.5");
    });

    test("should preserve two decimal places", () => {
      expect(formatNumber(20.42)).toBe("20.42");
    });

    test("should preserve three decimal places", () => {
      expect(formatNumber(20.123)).toBe("20.123");
    });

    test("should preserve four decimal places", () => {
      expect(formatNumber(20.1234)).toBe("20.1234");
    });

    test("should round to four decimal places", () => {
      expect(formatNumber(20.12345)).toBe("20.1235");
    });

    test("should round to four decimal places for long decimals", () => {
      expect(formatNumber(20.123456789)).toBe("20.1235");
    });
  });

  // Test price formatting mode
  describe("price formatting mode", () => {
    test("should format integer as price with two decimals", () => {
      expect(formatNumber(20, true)).toBe("20.00");
    });

    test("should format decimal as price with two decimals", () => {
      expect(formatNumber(20.5, true)).toBe("20.50");
    });

    test("should round to two decimals in price mode", () => {
      expect(formatNumber(20.129, true)).toBe("20.13");
    });

    test("should format large number as price with spaces", () => {
      expect(formatNumber(1000000.5, true)).toBe("1 000 000.50");
    });
  });

  // Test string number inputs
  describe("string number inputs", () => {
    test("should handle string integer input", () => {
      expect(formatNumber("20")).toBe("20.0");
    });

    test("should handle string decimal input", () => {
      expect(formatNumber("20.5")).toBe("20.5");
    });

    test("should handle string price input", () => {
      expect(formatNumber("20.5", true)).toBe("20.50");
    });
  });

  // Test edge cases
  describe("edge cases", () => {
    test("should handle very small numbers", () => {
      expect(formatNumber(0.0001)).toBe("0.0001");
    });

    test("should handle very large numbers", () => {
      expect(formatNumber(1234567890.12345)).toBe("1 234 567 890.1235");
    });

    test("should handle negative decimals", () => {
      expect(formatNumber(-20.12345)).toBe("-20.1235");
    });

    test("should handle trailing zeros in input", () => {
      expect(formatNumber("20.00000")).toBe("20.0");
    });
  });
});
