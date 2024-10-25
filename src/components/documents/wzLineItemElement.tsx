import React, { useEffect, useState, useCallback } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
const independentUnits = ["kpl", "t", "mb"];

const calculateM3 = (height, length, width) => {
  return (height * length * width) / 1000000000;
};

const calculateSztFromM3 = (m3Value, product) => {
  const m3PerPiece = calculateM3(
    product?.height || 0,
    product?.length || 0,
    product?.width || 0
  );
  if (m3PerPiece <= 0) return "0";
  return Math.ceil(parseFloat(m3Value) / m3PerPiece).toString();
};

const calculateM3FromSzt = (sztValue, product) => {
  const m3PerPiece = calculateM3(
    product?.height || 0,
    product?.length || 0,
    product?.width || 0
  );
  return (Math.ceil(parseFloat(sztValue)) * m3PerPiece).toFixed(3);
};

const calculateM3FromOpak = (opakValue, product) => {
  const m3PerProduct = calculateM3(
    product?.height || 0,
    product?.length || 0,
    product?.width || 0
  );
  const m3PerPackage = m3PerProduct * (product?.quantity_in_package || 1);
  return (Math.ceil(parseFloat(opakValue)) * m3PerPackage).toFixed(3);
};

const calculateOpakFromM3 = (m3Value, product) => {
  const m3PerProduct = calculateM3(
    product?.height || 0,
    product?.length || 0,
    product?.width || 0
  );
  const m3PerPackage = m3PerProduct * (product?.quantity_in_package || 1);
  if (m3PerPackage <= 0) return "0";
  return Math.ceil(parseFloat(m3Value) / m3PerPackage).toString();
};

export const WzLineItemsComponent = ({ lineItems }) => {
  const { control } = useFormContext();
  const { fields, update } = useFieldArray({
    control,
    name: "line_items",
    keyName: "key",
  });

  const [selectAllCheckbox, setSelectAllCheckbox] = useState(false);
  const [checkIfAllSelected, setCheckIfAllSelected] = useState(false);

  useEffect(() => {
    const selected = fields.filter((item) => item.included_in_wz);
    if (selected.length === fields.length) {
      !selectAllCheckbox && setSelectAllCheckbox(true);
    } else {
      selectAllCheckbox && setSelectAllCheckbox(false);
    }
    setCheckIfAllSelected(false);
  }, [checkIfAllSelected]);
  const toggleSelectAll = (value: boolean) => {
    // Prevent form submission
    const handleSelectAll = (e) => {
      e.preventDefault();
      fields.forEach((_item, index) => {
        handleCheckboxChange(index, value);
      });
      setSelectAllCheckbox(value);
    };

    handleSelectAll({ preventDefault: () => {} });
  };

  const handleCheckboxChange = (index, checked) => {
    const field = fields[index];
    update(index, {
      ...field,
      included_in_wz: checked,
      wz_quantity: checked ? field.quantity : "",
      helper_quantity: checked ? field.helper_quantity : "",
      original_helper_quantity: field.helper_quantity,
    });
    setCheckIfAllSelected(true);
  };

  const handleUnitChange = (index, value) => {
    const item = fields[index];
    const product = lineItems[index];

    if (!product) return;

    const previousUnit = item.wz_unit;
    let updatedItem = { ...item, wz_unit: value };

    // Handle unit conversion
    if (
      value === "szt" ||
      previousUnit === "szt" ||
      value === "opak" ||
      previousUnit === "opak"
    ) {
      if (value === "szt" && previousUnit === "m3") {
        const pieces = Math.ceil(
          parseFloat(updatedItem.wz_quantity || 0) /
            calculateM3(product.height, product.length, product.width)
        );
        updatedItem.wz_quantity = pieces.toString();
        if (updatedItem.help_quant_unit === "m3") {
          updatedItem.helper_quantity = calculateM3FromSzt(
            pieces.toString(),
            product
          );
        }
      } else if (value === "m3" && previousUnit === "szt") {
        const pieces = Math.ceil(parseFloat(updatedItem.wz_quantity || 0));
        updatedItem.wz_quantity = calculateM3FromSzt(
          pieces.toString(),
          product
        );
      } else if (value === "opak" && previousUnit === "m3") {
        const packages = calculateOpakFromM3(
          updatedItem.wz_quantity || "0",
          product
        );
        updatedItem.wz_quantity = packages;
        if (updatedItem.help_quant_unit === "m3") {
          updatedItem.helper_quantity = calculateM3FromOpak(packages, product);
        }
      } else if (value === "m3" && previousUnit === "opak") {
        const packages = Math.ceil(parseFloat(updatedItem.wz_quantity || 0));
        updatedItem.wz_quantity = calculateM3FromOpak(
          packages.toString(),
          product
        );
      }
    }

    // Handle helper unit setup
    switch (value) {
      case "m3":
        if (!updatedItem.help_quant_unit) {
          updatedItem.help_quant_unit = "opak";
          if (updatedItem.wz_quantity) {
            updatedItem.helper_quantity = calculateOpakFromM3(
              updatedItem.wz_quantity,
              product
            );
          }
        }
        break;
      case "szt":
      case "opak":
        if (!updatedItem.help_quant_unit) {
          updatedItem.help_quant_unit = "m3";
          if (updatedItem.wz_quantity) {
            updatedItem.helper_quantity =
              value === "szt"
                ? calculateM3FromSzt(updatedItem.wz_quantity, product)
                : calculateM3FromOpak(updatedItem.wz_quantity, product);
          }
        }
        break;
    }

    // Ensure we don't exceed original quantity
    const originalValue = convertToUnit(
      item.quantity,
      item.quant_unit,
      value,
      product
    );
    if (parseFloat(updatedItem.wz_quantity) > parseFloat(originalValue)) {
      updatedItem.wz_quantity = originalValue;
    }

    update(index, updatedItem);
  };

  const convertToUnit = useCallback(
    (value, fromUnit, toUnit, product) => {
      if (fromUnit === toUnit) return value;

      const conversions = {
        m3_to_szt: (val) => calculateSztFromM3(val, product),
        szt_to_m3: (val) => calculateM3FromSzt(val, product),
        m3_to_opak: (val) => calculateOpakFromM3(val, product),
        opak_to_m3: (val) => calculateM3FromOpak(val, product),
        // Add more conversions as needed
      };

      const key = `${fromUnit}_to_${toUnit}`;
      return conversions[key] ? conversions[key](value) : value;
    },
    [
      calculateSztFromM3,
      calculateM3FromSzt,
      calculateOpakFromM3,
      calculateM3FromOpak,
    ]
  );

  const handleHelpUnitChange = (index, value) => {
    const item = fields[index];
    const product = lineItems[index];

    if (!product || independentUnits.includes(value)) {
      update(index, { ...item, help_quant_unit: value });
      return;
    }

    let updatedItem = { ...item, help_quant_unit: value };

    if (updatedItem.wz_quantity) {
      if (value === "szt" && updatedItem.wz_unit === "m3") {
        updatedItem.helper_quantity = calculateSztFromM3(
          updatedItem.wz_quantity,
          product
        );
      } else if (value === "m3" && updatedItem.wz_unit === "szt") {
        updatedItem.helper_quantity = calculateM3FromSzt(
          updatedItem.wz_quantity,
          product
        );
      } else if (value === "opak" && updatedItem.wz_unit === "m3") {
        updatedItem.helper_quantity = calculateOpakFromM3(
          updatedItem.wz_quantity,
          product
        );
      } else if (value === "m3" && updatedItem.wz_unit === "opak") {
        updatedItem.helper_quantity = calculateM3FromOpak(
          updatedItem.wz_quantity,
          product
        );
      }
    }

    update(index, updatedItem);
  };

  const updateField = useCallback(
    (index, updates) => {
      const currentField = fields[index];
      const updatedField = {
        ...currentField,
        ...updates,
      };

      requestAnimationFrame(() => {
        update(index, updatedField);
      });
    },
    [fields, update]
  );

  // Memoized input handlers
  const handleQuantityChange = useCallback(
    (index, value) => {
      const item = fields[index];
      const product = lineItems[index].product;
      let updates = { wz_quantity: value };

      if (item.help_quant_unit && value !== "") {
        if (item.wz_unit === "m3" && item.help_quant_unit === "szt") {
          updates.helper_quantity = calculateSztFromM3(value, product);
        } else if (item.wz_unit === "szt" && item.help_quant_unit === "m3") {
          updates.helper_quantity = calculateM3FromSzt(value, product);
        } else if (item.wz_unit === "opak" && item.help_quant_unit === "m3") {
          updates.helper_quantity = calculateM3FromOpak(value, product);
        } else if (item.wz_unit === "m3" && item.help_quant_unit === "opak") {
          updates.helper_quantity = calculateOpakFromM3(value, product);
        }
      }

      updateField(index, updates);
    },
    [fields, lineItems, updateField]
  );

  const handleHelperQuantityChange = useCallback(
    (index, value) => {
      const item = fields[index];
      const product = lineItems[index].product;
      let updates = { helper_quantity: value };

      if (!independentUnits.includes(item.help_quant_unit) && value !== "") {
        if (item.help_quant_unit === "szt" && item.wz_unit === "m3") {
          updates.wz_quantity = calculateM3FromSzt(value, product);
        } else if (item.help_quant_unit === "m3" && item.wz_unit === "szt") {
          updates.wz_quantity = calculateSztFromM3(value, product);
        } else if (item.help_quant_unit === "m3" && item.wz_unit === "opak") {
          updates.wz_quantity = calculateOpakFromM3(value, product);
        } else if (item.help_quant_unit === "opak" && item.wz_unit === "m3") {
          updates.wz_quantity = calculateM3FromOpak(value, product);
        }
      }

      updateField(index, updates);
    },
    [fields, lineItems, independentUnits, updateField]
  );

  // Custom input components to prevent re-renders
  const QuantityInput = React.memo(({ index, value, onChange, disabled }) => (
    <Input
      value={value || ""}
      onChange={(e) => onChange(index, e.target.value)}
      disabled={disabled}
      className="w-20"
    />
  ));

  const HelperQuantityInput = React.memo(
    ({ index, value, onChange, disabled }) => (
      <Input
        value={value || ""}
        onChange={(e) => onChange(index, e.target.value)}
        disabled={disabled}
        className="w-20"
      />
    )
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Pozycje dokumentu WZ</h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-white">
            <TableHead className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div onClick={(e) => e.preventDefault()}>
                    <Checkbox
                      checked={selectAllCheckbox}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                      className="mr-2 mb-1"
                      type="button"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Uwzględnij wszystkie
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead>Nazwa produktu</TableHead>
            <TableHead>Ilość pozostała w zamówieniu</TableHead>
            <TableHead>Jednostka</TableHead>
            <TableHead>Ilość w WZ</TableHead>
            <TableHead>Jednostka WZ</TableHead>
            <TableHead>Ilość pomocnicza</TableHead>
            <TableHead>Jednostka pomocnicza</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((item, index) => (
            <TableRow key={item.key}>
              <TableCell>
                <div onClick={(e) => e.preventDefault()}>
                  <Checkbox
                    checked={item.included_in_wz}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(index, checked)
                    }
                    type="button"
                  />
                </div>
              </TableCell>
              <TableCell>{item.product_name}</TableCell>
              <TableCell>{formatNumber(item.quantity)}</TableCell>
              <TableCell>{item.quant_unit}</TableCell>
              <TableCell>
                <QuantityChange index={index} />
              </TableCell>
              <TableCell>
                <Select
                  value={item.wz_unit || ""}
                  onValueChange={(value) => handleUnitChange(index, value)}
                  disabled={!item.included_in_wz}
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
              </TableCell>
              <TableCell>
                <HelpQuantityChange index={index} />
              </TableCell>
              <TableCell>
                <Select
                  value={item.help_quant_unit || ""}
                  onValueChange={(value) => handleHelpUnitChange(index, value)}
                  disabled={!item.included_in_wz}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WzLineItemsComponent;
// Update QuantityChange component
export const QuantityChange = ({ index }) => {
  const { control, setValue, watch } = useFormContext();
  const { fields, update } = useFieldArray({
    control,
    name: "line_items",
    keyName: "key",
  });
  const [localValue, setLocalValue] = useState(
    fields[index]?.wz_quantity || ""
  );

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    const item = fields[index];
    const product = item.product;

    // Check against original quantity
    const originalQuantity = parseFloat(item.quantity);
    const newQuantity = parseFloat(value);

    if (value !== "" && !isNaN(newQuantity)) {
      // Convert original quantity to current unit if units are different
      let maxQuantity = originalQuantity;
      if (item.quant_unit !== item.wz_unit) {
        if (item.quant_unit === "m3" && item.wz_unit === "szt") {
          maxQuantity = parseFloat(
            calculateSztFromM3(originalQuantity.toString(), product)
          );
        } else if (item.quant_unit === "szt" && item.wz_unit === "m3") {
          maxQuantity = parseFloat(
            calculateM3FromSzt(originalQuantity.toString(), product)
          );
        } else if (item.quant_unit === "m3" && item.wz_unit === "opak") {
          maxQuantity = parseFloat(
            calculateOpakFromM3(originalQuantity.toString(), product)
          );
        } else if (item.quant_unit === "opak" && item.wz_unit === "m3") {
          maxQuantity = parseFloat(
            calculateM3FromOpak(originalQuantity.toString(), product)
          );
        }
      }

      if (newQuantity > maxQuantity) {
        setLocalValue(maxQuantity.toString());
        setValue(`line_items.${index}.wz_quantity`, maxQuantity.toString(), {
          shouldDirty: true,
        });
        return;
      }
    }

    // Update local and form values without adjustment
    setLocalValue(value);
    setValue(`line_items.${index}.wz_quantity`, value, { shouldDirty: true });

    // Only update helper quantity during typing, no main quantity adjustments
    if (item.help_quant_unit && value !== "") {
      let helperQuantity;

      if (item.wz_unit === "m3" && item.help_quant_unit === "szt") {
        helperQuantity = calculateSztFromM3(value, product);
      } else if (item.wz_unit === "m3" && item.help_quant_unit === "opak") {
        helperQuantity = calculateOpakFromM3(value, product);
      } else if (item.wz_unit === "szt" && item.help_quant_unit === "m3") {
        helperQuantity = calculateM3FromSzt(value, product);
      } else if (item.wz_unit === "opak" && item.help_quant_unit === "m3") {
        helperQuantity = calculateM3FromOpak(value, product);
      }

      if (helperQuantity) {
        setValue(`line_items.${index}.helper_quantity`, helperQuantity, {
          shouldDirty: true,
        });
      }
    }
  };

  // Handle blur event for package-based adjustments
  const handleBlur = () => {
    const item = fields[index];
    const product = item.product;

    if (!item.help_quant_unit || !localValue || isNaN(parseFloat(localValue)))
      return;

    // Only adjust on blur when we have m3 as main unit and szt/opak as helper
    if (
      item.wz_unit === "m3" &&
      (item.help_quant_unit === "szt" || item.help_quant_unit === "opak")
    ) {
      let helperQty, adjustedM3;

      if (item.help_quant_unit === "szt") {
        helperQty = calculateSztFromM3(localValue, product);
        adjustedM3 = calculateM3FromSzt(helperQty, product);
      } else if (item.help_quant_unit === "opak") {
        helperQty = calculateOpakFromM3(localValue, product);
        adjustedM3 = calculateM3FromOpak(helperQty, product);
      }

      setLocalValue(adjustedM3);
      setValue(`line_items.${index}.wz_quantity`, adjustedM3, {
        shouldDirty: true,
      });
      setValue(`line_items.${index}.helper_quantity`, helperQty, {
        shouldDirty: true,
      });
    }
  };

  // Handle unit changes
  useEffect(() => {
    const item = fields[index];
    if (!item || !localValue || !item.help_quant_unit) return;

    // Trigger adjustment when units change
    if (
      item.wz_unit === "m3" &&
      (item.help_quant_unit === "szt" || item.help_quant_unit === "opak")
    ) {
      handleBlur();
    }
  }, [fields[index]?.wz_unit, fields[index]?.help_quant_unit]);

  // Update local state when field value changes externally
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === `line_items.${index}.wz_quantity`) {
        setLocalValue(value?.line_items?.[index]?.wz_quantity || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, index]);

  return (
    <Input
      value={localValue}
      onChange={handleQuantityChange}
      onBlur={handleBlur}
      disabled={!fields[index].included_in_wz}
      className="w-20"
    />
  );
};

export const HelpQuantityChange = ({ index }) => {
  const { control, setValue, watch } = useFormContext();
  const { fields, update } = useFieldArray({
    control,
    name: "line_items",
    keyName: "key",
  });
  const [localValue, setLocalValue] = useState(
    fields[index]?.helper_quantity || ""
  );

  const handleHelpQuantityChange = (e) => {
    const value = e.target.value;
    setLocalValue(value);

    const item = fields[index];
    const product = item.product;

    setValue(`line_items.${index}.helper_quantity`, value, {
      shouldDirty: true,
    });

    if (!independentUnits.includes(item.help_quant_unit) && value !== "") {
      let mainQuantity;

      // Calculate main quantity based on helper unit
      if (item.help_quant_unit === "szt" && item.wz_unit === "m3") {
        mainQuantity = calculateM3FromSzt(value, product);
      } else if (item.help_quant_unit === "m3" && item.wz_unit === "szt") {
        mainQuantity = calculateSztFromM3(value, product);
      } else if (item.help_quant_unit === "m3" && item.wz_unit === "opak") {
        mainQuantity = calculateOpakFromM3(value, product);
      } else if (item.help_quant_unit === "opak" && item.wz_unit === "m3") {
        mainQuantity = calculateM3FromOpak(value, product);
      }

      if (mainQuantity) {
        setValue(`line_items.${index}.wz_quantity`, mainQuantity, {
          shouldDirty: true,
        });
      }
    }
  };

  // Update local state when field value changes externally
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === `line_items.${index}.helper_quantity`) {
        setLocalValue(value?.line_items?.[index]?.helper_quantity || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, index]);

  return (
    <Input
      value={localValue}
      onChange={handleHelpQuantityChange}
      disabled={!fields[index].included_in_wz}
      className="w-20"
    />
  );
};
