import React, { useEffect, useCallback, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductSelectionDialog from "./productSelectionDialog";
import { ContactPersonFormElement } from "../customers/contactPersonFormElement";
import { formatNumber } from "@/lib/utils";

const quantityUnits = [
  { value: "m3", label: "m3" },
  { value: "m2", label: "m2" },
  { value: "opak", label: "opak" },
  { value: "mb", label: "mb" },
  { value: "kpl", label: "kpl" },
  { value: "kg", label: "kg" },
  { value: "szt", label: "szt" },
  { value: "t", label: "t" },
];

export default function ProductSelectionForm({
  name,
  products,
  lineItems = [],
}) {
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove, replace, update } = useFieldArray({
    control,
    name,
    keyName: "key",
  });

  const [test, setTest] = useState(true);
  const [m3FirstProvided, setM3FirstProvided] = useState({});
  const [lastUpdatedField, setLastUpdatedField] = useState({
    index: null,
    field: null,
  });

  const independentUnits = ["kpl", "t", "mb"];

  useEffect(() => {
    if (lineItems.length > 0 && fields.length === 0 && test) {
      replace(lineItems);
      setTest(false);
    }
  }, [lineItems, replace, fields.length]);

  useEffect(() => {
    setValue(`${name}.new.vat_percentage`, "23");
  }, [setValue, name]);

  const calculateM3 = useCallback((height, length, width) => {
    return (height * length * width) / 1000000000;
  }, []);

  const shouldUseHelperQuantity = useCallback(
    (productId) => {
      const product = products.find((p) => p.id === productId);
      return (
        product &&
        (product.category === "Kształtki" || product.category === "Formatki")
      );
    },
    [products]
  );

  const getEffectiveQuantity = useCallback(
    (item, product) => {
      const isSpecialCategory =
        product.category === "Kształtki" || product.category === "Formatki";

      if (!isSpecialCategory) {
        return parseFloat(item.quantity) || 0;
      }

      // For special categories, always use szt quantity
      if (item.quant_unit === "szt") {
        return parseFloat(item.quantity) || 0;
      }

      if (item.help_quant_unit === "szt") {
        return parseFloat(item.helper_quantity) || 0;
      }

      // If main unit is m3 and no szt helper, calculate pieces
      if (item.quant_unit === "m3") {
        const m3Value = parseFloat(item.quantity) || 0;
        const m3PerPiece = calculateM3(
          product.height,
          product.length,
          product.width
        );
        return Math.floor(m3Value / m3PerPiece);
      }

      // If main unit is opak, calculate pieces from packages
      if (item.quant_unit === "opak") {
        const packages = parseFloat(item.quantity) || 0;
        return packages * product.quantity_in_package;
      }

      return parseFloat(item.quantity) || 0;
    },
    [calculateM3]
  );

  const calculateM2 = useCallback((length, width) => {
    return (length * width) / 1000000;
  }, []);

  const calculateConversion = useCallback(
    (value, fromUnit, toUnit, product) => {
      if (!product || !value) return "";

      const m3PerProduct = calculateM3(
        product.height,
        product.length,
        product.width
      );
      const m2PerProduct = calculateM2(product.length, product.width);
      const m3PerPackage = m3PerProduct * product.quantity_in_package;
      const m2PerPackage = m2PerProduct * product.quantity_in_package;

      const conversions = {
        // Existing conversions
        m3_to_opak: (val) => Math.ceil(val / m3PerPackage).toString(),
        opak_to_m3: (val) => (val * m3PerPackage).toFixed(3),
        szt_to_opak: (val) =>
          Math.ceil(val / product.quantity_in_package).toString(),
        opak_to_szt: (val) => (val * product.quantity_in_package).toString(),
        m2_to_opak: (val) => Math.ceil(val / m2PerPackage).toString(),
        opak_to_m2: (val) => (val * m2PerPackage).toFixed(3),

        // New conversions
        m3_to_m2: (val) => {
          // Convert m3 to m2 based on product height
          // m2 = m3 / height(in meters)
          const heightInMeters = product.height / 1000; // Convert mm to m
          return (parseFloat(val) / heightInMeters).toFixed(3);
        },
        m2_to_m3: (val) => {
          // Convert m2 to m3 based on product height
          const heightInMeters = product.height / 1000;
          return (parseFloat(val) * heightInMeters).toFixed(3);
        },
        m3_to_kg: (val) => {
          if (!product.weight) {
            console.warn("Weight per m3 not specified for product");
            return val;
          }
          // Convert m3 to kg using weight
          return (parseFloat(val) * product.weight).toFixed(3);
        },
        kg_to_m3: (val) => {
          if (!product.weight) {
            console.warn("Weight per m3 not specified for product");
            return val;
          }
          // Convert kg to m3 using weight
          return (parseFloat(val) / product.weight).toFixed(3);
        },
        m2_to_kg: (val) => {
          if (!product.weight) {
            console.warn("Weight per m3 not specified for product");
            return val;
          }
          // First convert m2 to m3, then to kg
          const heightInMeters = product.height / 1000;
          const m3Value = parseFloat(val) * heightInMeters;
          return (m3Value * product.weight).toFixed(3);
        },
        kg_to_m2: (val) => {
          if (!product.weight) {
            console.warn("Weight per m3 not specified for product");
            return val;
          }
          // First convert kg to m3, then to m2
          const heightInMeters = product.height / 1000;
          const m3Value = parseFloat(val) / product.weight;
          return (m3Value / heightInMeters).toFixed(3);
        },
      };

      const conversionKey = `${fromUnit}_to_${toUnit}`;
      return conversions[conversionKey]
        ? conversions[conversionKey](parseFloat(value))
        : value;
    },
    [calculateM3, calculateM2]
  );

  const adjustQuantities = useCallback(
    (item, product, shouldAdjustMain = false) => {
      if (!item.quantity || !item.quant_unit || !item.help_quant_unit)
        return item;

      // Calculate helper quantity based on current main quantity
      const helperQty = calculateConversion(
        item.quantity,
        item.quant_unit,
        item.help_quant_unit,
        product
      );

      if (!shouldAdjustMain) {
        return {
          ...item,
          helper_quantity: helperQty,
        };
      }

      // Calculate back to main quantity for package-based adjustments
      const adjustedMainQty = calculateConversion(
        helperQty,
        item.help_quant_unit,
        item.quant_unit,
        product
      );

      return {
        ...item,
        quantity: adjustedMainQty,
        helper_quantity: helperQty,
      };
    },
    [calculateConversion]
  );

  const calculateSztFromM3 = useCallback(
    (m3Value, product) => {
      const m3PerPiece = calculateM3(
        product.height,
        product.length,
        product.width
      );
      if (m3PerPiece <= 0) return "0";
      return Math.ceil(parseFloat(m3Value) / m3PerPiece).toString();
    },
    [calculateM3]
  );

  const calculateM3FromSzt = useCallback(
    (sztValue, product) => {
      const m3PerPiece = calculateM3(
        product.height,
        product.length,
        product.width
      );
      // Always return volume for whole pieces
      return (Math.ceil(parseFloat(sztValue)) * m3PerPiece).toFixed(3);
    },
    [calculateM3]
  );

  const calculateM3FromOpak = useCallback(
    (opakValue, product) => {
      const m3PerProduct = calculateM3(
        product.height,
        product.length,
        product.width
      );
      const m3PerPackage = m3PerProduct * product.quantity_in_package;
      return (Math.ceil(parseFloat(opakValue)) * m3PerPackage).toFixed(3);
    },
    [calculateM3]
  );

  const calculateOpakFromM3 = useCallback(
    (m3Value, product) => {
      const m3PerProduct = calculateM3(
        product.height,
        product.length,
        product.width
      );
      const m3PerPackage = m3PerProduct * product.quantity_in_package;
      if (m3PerPackage <= 0) return "0";
      return Math.ceil(parseFloat(m3Value) / m3PerPackage).toString();
    },
    [calculateM3]
  );

  const handleQuantityBlur = useCallback(
    (index) => {
      const item = fields[index];
      const product = products.find((p) => p.id === item.product_id);

      if (!product || !item.help_quant_unit) return;

      if (item.quant_unit === "szt" && item.help_quant_unit === "m3") {
        // When main unit is szt and helper is m3
        const helperQty = calculateM3FromSzt(item.quantity || "0", product);
        if (helperQty !== item.helper_quantity) {
          update(index, {
            ...item,
            helper_quantity: helperQty,
          });
        }
      } else if (item.quant_unit === "opak" && item.help_quant_unit === "m3") {
        // When main unit is opak and helper is m3
        const helperQty = calculateM3FromOpak(item.quantity || "0", product);
        if (helperQty !== item.helper_quantity) {
          update(index, {
            ...item,
            helper_quantity: helperQty,
          });
        }
      } else if (item.help_quant_unit === "szt" && item.quant_unit === "m3") {
        // When helper is szt and main is m3
        const helperQty = calculateSztFromM3(item.quantity || "0", product);
        const adjustedM3 = calculateM3FromSzt(helperQty, product);

        if (
          helperQty !== item.helper_quantity ||
          adjustedM3 !== item.quantity
        ) {
          update(index, {
            ...item,
            quantity: adjustedM3,
            helper_quantity: helperQty,
          });
        }
      } else if (item.help_quant_unit === "opak" && item.quant_unit === "m3") {
        // When helper is opak and main is m3
        const helperQty = calculateOpakFromM3(item.quantity || "0", product);
        const adjustedM3 = calculateM3FromOpak(helperQty, product);

        if (
          helperQty !== item.helper_quantity ||
          adjustedM3 !== item.quantity
        ) {
          update(index, {
            ...item,
            quantity: adjustedM3,
            helper_quantity: helperQty,
          });
        }
      } else if (!independentUnits.includes(item.help_quant_unit)) {
        const adjusted = adjustQuantities(item, product, true);
        update(index, adjusted);
      }
    },
    [
      fields,
      products,
      update,
      adjustQuantities,
      calculateSztFromM3,
      calculateM3FromSzt,
      calculateM3FromOpak,
      calculateOpakFromM3,
      independentUnits,
    ]
  );

  const handleInputChange = useCallback(
    (index, field, value, isBlur = false) => {
      const updatedItem = { ...fields[index], [field]: value };
      const product = products.find((p) => p.id === updatedItem.product_id);

      if (!product) {
        console.error("Product not found");
        return;
      }

      setLastUpdatedField({ index, field });

      switch (field) {
        case "help_quant_unit":
          // When helper unit is selected
          updatedItem.help_quant_unit = value;

          if (updatedItem.quantity) {
            if (independentUnits.includes(value)) {
              // For independent units, keep existing helper quantity
            } else if (updatedItem.quant_unit === "m3") {
              // When main unit is m3
              if (value === "szt") {
                const helperQty = calculateSztFromM3(
                  updatedItem.quantity,
                  product
                );
                const adjustedM3 = calculateM3FromSzt(helperQty, product);
                updatedItem.quantity = adjustedM3;
                updatedItem.helper_quantity = helperQty;
              } else if (value === "opak") {
                const helperQty = calculateOpakFromM3(
                  updatedItem.quantity,
                  product
                );
                const adjustedM3 = calculateM3FromOpak(helperQty, product);
                updatedItem.quantity = adjustedM3;
                updatedItem.helper_quantity = helperQty;
              }
            } else if (updatedItem.quant_unit === "szt" && value === "m3") {
              // When main unit is szt and helper is m3
              updatedItem.helper_quantity = calculateM3FromSzt(
                updatedItem.quantity,
                product
              );
            } else if (updatedItem.quant_unit === "opak" && value === "m3") {
              // When main unit is opak and helper is m3
              updatedItem.helper_quantity = calculateM3FromOpak(
                updatedItem.quantity,
                product
              );
            }
          }
          break;

        case "quantity":
          // For manual quantity changes
          if (updatedItem.help_quant_unit) {
            if (independentUnits.includes(updatedItem.help_quant_unit)) {
              // For independent units, don't calculate any conversion
            } else if (updatedItem.quant_unit === "szt") {
              // When main unit is szt
              if (updatedItem.help_quant_unit === "m3") {
                updatedItem.helper_quantity = calculateM3FromSzt(
                  value || "0",
                  product
                );
              }
            } else if (updatedItem.quant_unit === "opak") {
              // When main unit is opak
              if (updatedItem.help_quant_unit === "m3") {
                updatedItem.helper_quantity = calculateM3FromOpak(
                  value || "0",
                  product
                );
              }
            } else if (updatedItem.quant_unit === "m3") {
              // When main unit is m3
              if (updatedItem.help_quant_unit === "szt") {
                const helperQty = calculateSztFromM3(value || "0", product);
                if (!isBlur) {
                  updatedItem.helper_quantity = helperQty;
                } else {
                  const adjustedM3 = calculateM3FromSzt(helperQty, product);
                  updatedItem.quantity = adjustedM3;
                  updatedItem.helper_quantity = helperQty;
                }
              } else if (updatedItem.help_quant_unit === "opak") {
                const helperQty = calculateOpakFromM3(value || "0", product);
                if (!isBlur) {
                  updatedItem.helper_quantity = helperQty;
                } else {
                  const adjustedM3 = calculateM3FromOpak(helperQty, product);
                  updatedItem.quantity = adjustedM3;
                  updatedItem.helper_quantity = helperQty;
                }
              }
            }
          }
          break;

        case "helper_quantity":
          // When helper quantity changes
          if (updatedItem.help_quant_unit && updatedItem.quant_unit) {
            if (independentUnits.includes(updatedItem.help_quant_unit)) {
              // For independent units, don't calculate any conversion
            } else if (
              updatedItem.help_quant_unit === "szt" &&
              updatedItem.quant_unit === "m3"
            ) {
              // When helper is szt and main is m3
              updatedItem.quantity = calculateM3FromSzt(value || "0", product);
            } else if (
              updatedItem.help_quant_unit === "opak" &&
              updatedItem.quant_unit === "m3"
            ) {
              // When helper is opak and main is m3
              updatedItem.quantity = calculateM3FromOpak(value || "0", product);
            } else if (updatedItem.help_quant_unit === "m3") {
              // When helper is m3
              updatedItem.helper_quantity = value;
              if (updatedItem.quant_unit === "szt") {
                // Calculate szt from m3
                const pieces = calculateSztFromM3(value || "0", product);
                updatedItem.quantity = pieces;
              } else if (updatedItem.quant_unit === "opak") {
                // Calculate opak from m3
                const packages = calculateOpakFromM3(value || "0", product);
                updatedItem.quantity = packages;
              }
            }
          }
          break;

        case "quant_unit":
          const previousUnit = fields[index].quant_unit;
          updatedItem.quant_unit = value;

          // Handle unit changes
          if (
            value === "szt" ||
            previousUnit === "szt" ||
            value === "opak" ||
            previousUnit === "opak"
          ) {
            if (value === "szt" && previousUnit === "m3") {
              // m3 to szt
              const pieces = Math.ceil(
                parseFloat(updatedItem.quantity || 0) /
                  calculateM3(product.height, product.length, product.width)
              );
              updatedItem.quantity = pieces.toString();
              if (updatedItem.help_quant_unit === "m3") {
                updatedItem.helper_quantity = calculateM3FromSzt(
                  pieces.toString(),
                  product
                );
              }
            } else if (value === "m3" && previousUnit === "szt") {
              // szt to m3
              const pieces = Math.ceil(parseFloat(updatedItem.quantity || 0));
              updatedItem.quantity = calculateM3FromSzt(
                pieces.toString(),
                product
              );
            } else if (value === "opak" && previousUnit === "m3") {
              // m3 to opak
              const packages = calculateOpakFromM3(
                updatedItem.quantity || "0",
                product
              );
              updatedItem.quantity = packages;
              if (updatedItem.help_quant_unit === "m3") {
                updatedItem.helper_quantity = calculateM3FromOpak(
                  packages,
                  product
                );
              }
            } else if (value === "m3" && previousUnit === "opak") {
              // opak to m3
              const packages = Math.ceil(parseFloat(updatedItem.quantity || 0));
              updatedItem.quantity = calculateM3FromOpak(
                packages.toString(),
                product
              );
            }
          }

          // Handle helper unit setup and calculations
          switch (value) {
            case "m3":
              if (!updatedItem.help_quant_unit) {
                updatedItem.help_quant_unit = "opak";
                if (updatedItem.quantity) {
                  updatedItem.helper_quantity = calculateOpakFromM3(
                    updatedItem.quantity,
                    product
                  );
                }
              }
              break;
            case "m2":
              if (!updatedItem.help_quant_unit) {
                updatedItem.help_quant_unit = "opak";
              }
              break;
            case "szt":
            case "opak":
              // When switching to szt/opak as main unit, possibly set m3 as helper
              if (!updatedItem.help_quant_unit) {
                updatedItem.help_quant_unit = "m3";
                if (updatedItem.quantity) {
                  updatedItem.helper_quantity =
                    value === "szt"
                      ? calculateM3FromSzt(updatedItem.quantity, product)
                      : calculateM3FromOpak(updatedItem.quantity, product);
                }
              } else if (updatedItem.help_quant_unit === "m3") {
                updatedItem.helper_quantity =
                  value === "szt"
                    ? calculateM3FromSzt(updatedItem.quantity, product)
                    : calculateM3FromOpak(updatedItem.quantity, product);
              }
              break;
            default:
              if (!updatedItem.help_quant_unit) {
                updatedItem.help_quant_unit = "";
                updatedItem.helper_quantity = "";
              }
          }
          break;
      }

      // Calculate brutto cost
      const nettoCost = parseFloat(updatedItem.netto_cost) || 0;
      const vatPercentage = parseFloat(updatedItem.vat_percentage) || 0;
      updatedItem.brutto_cost = (nettoCost * (1 + vatPercentage / 100)).toFixed(
        2
      );

      update(index, updatedItem);
    },
    [
      fields,
      update,
      calculateSztFromM3,
      calculateM3FromSzt,
      calculateM3FromOpak,
      calculateOpakFromM3,
      calculateM3,
      independentUnits,
    ]
  );

  const handleHelperQuantityBlur = useCallback(
    (index) => {
      const item = fields[index];
      const product = products.find((p) => p.id === item.product_id);

      if (!product || !item.help_quant_unit) return;

      if (item.help_quant_unit === "m3") {
        if (item.quant_unit === "szt") {
          // On blur, adjust m3 to match whole pieces
          const pieces = item.quantity;
          const adjustedM3 = calculateM3FromSzt(pieces, product);
          if (adjustedM3 !== item.helper_quantity) {
            update(index, {
              ...item,
              helper_quantity: adjustedM3,
            });
          }
        } else if (item.quant_unit === "opak") {
          // On blur, adjust m3 to match whole packages
          const packages = item.quantity;
          const adjustedM3 = calculateM3FromOpak(packages, product);
          if (adjustedM3 !== item.helper_quantity) {
            update(index, {
              ...item,
              helper_quantity: adjustedM3,
            });
          }
        }
      }
    },
    [fields, products, update, calculateM3FromSzt, calculateM3FromOpak]
  );

  // In the render, update the helper quantity input to include onBlur:
  const renderHelperQuantityInput = (item, index) => (
    <Input
      value={item.helper_quantity?.toString()}
      onChange={(e) =>
        handleInputChange(index, "helper_quantity", e.target.value)
      }
      onBlur={() => handleHelperQuantityBlur(index)}
      className={`w-20 ${
        errors.line_items?.[index]?.helper_quantity
          ? "text-red-500 border-red-500"
          : ""
      }`}
      type="number"
      step=".0001"
      min="0"
    />
  );

  // Make sure to pass the blur handler to the quantity input:
  const renderQuantityInput = (item, index) => (
    <Input
      value={item.quantity?.toString()}
      onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
      onBlur={() => handleQuantityBlur(index)}
      className={`w-20 ${
        errors.line_items?.[index]?.quantity
          ? "text-red-500 border-red-500"
          : ""
      }`}
      type="number"
      step=".0001"
      min="0"
    />
  );

  const calculateItemValues = useCallback(
    (item) => {
      const product = products.find((p) => p.id === item.product_id);
      if (!product)
        return {
          nettoValue: "0.00",
          bruttoCost: "0.00",
          bruttoValue: "0.00",
          discountedNettoPrice: "0.00",
        };

      const quantity = getEffectiveQuantity(item, product);
      const nettoPrice = parseFloat(item.netto_cost) || 0;
      const discount = parseFloat(item.discount) || 0;
      const vatPercentage = parseFloat(item.vat_percentage) || 0;

      // Calculate discounted netto price
      const discountedNettoPrice = nettoPrice * ((100 - discount) / 100);

      // Calculate total netto value
      const nettoValue = quantity * discountedNettoPrice;

      // Calculate brutto price
      const bruttoCost = discountedNettoPrice * (1 + vatPercentage / 100);

      // Calculate total brutto value
      const bruttoValue = nettoValue * (1 + vatPercentage / 100);

      return {
        nettoValue: nettoValue.toFixed(2),
        bruttoCost: bruttoCost.toFixed(2),
        bruttoValue: bruttoValue.toFixed(2),
        discountedNettoPrice: discountedNettoPrice.toFixed(2),
      };
    },
    [products, getEffectiveQuantity]
  );

  const handleProductsSelected = useCallback(
    (selectedProducts) => {
      const newLineItems = selectedProducts.map((product) => ({
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        quantity: "0",
        quant_unit: product.primary_unit,
        helper_quantity: "",
        help_quant_unit: "",
        netto_cost: product.price,
        brutto_cost: product.brutto_cost,
        vat_percentage: product.vat,
        vat_cost: product.vat_cost,
        height: product.height,
        length: product.length,
        width: product.width,
        quantity_in_package: product.quantity_in_package,
      }));
      append(newLineItems);
    },
    [append]
  );

  const calculateM3Total = useCallback(() => {
    return fields
      .reduce((total, item) => {
        // Handle items with m3 as main unit
        if (item.quant_unit === "m3") {
          return total + (parseFloat(item.quantity) || 0);
        }
        // Calculate m3 from dimensions for other items
        const product = products.find((p) => p.id === item.product_id);
        if (product && product.height && product.length && product.width) {
          const quantity = parseFloat(item.quantity) || 0;
          const m3PerUnit = calculateM3(
            product.height,
            product.length,
            product.width
          );
          return total + quantity * m3PerUnit;
        }
        return total;
      }, 0)
      .toFixed(3);
  }, [fields, products, calculateM3]);

  const calculateNettoTotal = useCallback(() => {
    return fields
      .reduce((total, item) => {
        const { nettoValue } = calculateItemValues(item);
        return total + parseFloat(nettoValue);
      }, 0)
      .toFixed(2);
  }, [fields, calculateItemValues]);

  const calculateBruttoTotal = useCallback(() => {
    return fields
      .reduce((total, item) => {
        const { bruttoValue } = calculateItemValues(item);
        return total + parseFloat(bruttoValue);
      }, 0)
      .toFixed(2);
  }, [fields, calculateItemValues]);

  const renderQuantitySelect = useCallback(
    (item, index, field) => (
      <Select
        value={item[field]}
        onValueChange={(value) => handleInputChange(index, field, value)}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="" />
        </SelectTrigger>
        <SelectContent>
          {quantityUnits.map((unit) => (
            <SelectItem key={unit.value} value={unit.value}>
              {unit.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
    [handleInputChange]
  );

  const handleRemoveItem = useCallback(
    (index) => {
      remove(index);
    },
    [remove]
  );

  const displayCellError = (err: { message: string }) =>
    err?.message && (
      <p className="text-xs mr-1 leading-none text-destructive">
        {err.message}
      </p>
    );

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {errors.line_items?.message && (
          <p className="text-sm font-small text-destructive mt-1 h5  min-h-5 max-h-5">
            {errors.line_items.message as string}
          </p>
        )}
        <div className="mb-4 flex justify-between items-center">
          <ProductSelectionDialog
            products={products}
            onProductsSelected={handleProductsSelected}
          />
          <div className="font-semibold flex flex-row">
            <div className="mr-5">
              Suma m³: {formatNumber(calculateM3Total(), true)} m³
            </div>
            <div className="mr-5">
              Suma netto: {formatNumber(calculateNettoTotal(), true)} zł
            </div>
            <div>
              Suma brutto: {formatNumber(calculateBruttoTotal(), true)} zł
            </div>
          </div>
        </div>
        <div className="max-h-[300px] overflow-auto">
          <h3 className="mb-4 font-semibold">Wybrane produkty</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead>Nr.</TableHead>
                <TableHead>Nazwa pozycji</TableHead>
                <TableHead>Ilość</TableHead>
                <TableHead>Jednostka</TableHead>
                <TableHead>Ilość pomocnicza</TableHead>
                <TableHead>Jednostka pomocnicza</TableHead>
                <TableHead>Cena netto *</TableHead>
                <TableHead>Rabat</TableHead>
                <TableHead>Wartość netto</TableHead>
                <TableHead>VAT</TableHead>
                <TableHead>Cena brutto</TableHead>
                <TableHead>Wartość brutto</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((item, index) => {
                const {
                  nettoValue,
                  bruttoCost,
                  bruttoValue,
                  discountedNettoPrice,
                } = calculateItemValues(item);

                const itemErrors =
                  errors.line_items &&
                  Array.isArray(errors.line_items) &&
                  errors.line_items[index];

                return (
                  <TableRow key={item.id}>
                    <TableCell>{String(index + 1).padStart(2, "0")}</TableCell>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>
                      {renderQuantityInput(item, index)}
                      {displayCellError(itemErrors?.quantity)}
                    </TableCell>
                    <TableCell>
                      {renderQuantitySelect(item, index, "quant_unit")}
                    </TableCell>
                    <TableCell>
                      {renderHelperQuantityInput(item, index)}
                      {displayCellError(itemErrors?.helper_quantity)}
                    </TableCell>
                    <TableCell>
                      {renderQuantitySelect(item, index, "help_quant_unit")}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.netto_cost}
                        onChange={(e) =>
                          handleInputChange(index, "netto_cost", e.target.value)
                        }
                        className={`w-24 ${
                          itemErrors?.netto_cost
                            ? "text-red-500 border-red-500"
                            : ""
                        }`}
                        type="number"
                        step=".01"
                        min="0"
                      />
                      {displayCellError(itemErrors?.netto_cost)}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.discount}
                        onChange={(e) =>
                          handleInputChange(index, "discount", e.target.value)
                        }
                        className="w-24"
                        type="number"
                        step=".01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>{formatNumber(nettoValue, true)} zł</TableCell>
                    <TableCell>
                      <Select
                        value={item.vat_percentage}
                        onValueChange={(value) =>
                          handleInputChange(index, "vat_percentage", value)
                        }
                      >
                        <SelectTrigger className="w-[70px]">
                          <SelectValue placeholder="VAT" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="8">8%</SelectItem>
                          <SelectItem value="11.5">11.5%</SelectItem>
                          <SelectItem value="23">23%</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatNumber(bruttoCost, true)} zł</TableCell>
                    <TableCell>{formatNumber(bruttoValue, true)} zł</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveItem(index);
                        }}
                      >
                        Usuń
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
