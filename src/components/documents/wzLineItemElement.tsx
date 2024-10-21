import React, { useEffect, useState } from "react";
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
    fields.forEach((_item, index) => {
      handleCheckboxChange(index, value);
    });
    setSelectAllCheckbox(value);
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
    update(index, { ...fields[index], wz_unit: value });
  };

  const handleHelpUnitChange = (index, value) => {
    update(index, { ...fields[index], help_quant_unit: value });
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Pozycje dokumentu WZ</h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-white">
            <TableHead className="flex items-center">
              <Tooltip>
                <TooltipTrigger>
                  <Checkbox
                    checked={selectAllCheckbox}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                    className="mr-2 mb-1"
                  />
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
                <Checkbox
                  checked={item.included_in_wz}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(index, checked)
                  }
                />
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

export const HelpQuantityChange = ({ index }) => {
  const { control } = useFormContext();
  const { fields, update } = useFieldArray({
    control,
    name: "line_items",
    keyName: "key",
  });

  const handleHelpQuantityChange = (index, value) => {
    const originalHelperQuantity = parseFloat(
      fields[index].original_helper_quantity
    );
    let newValue = value;

    if (value !== "" && !isNaN(parseFloat(value))) {
      const newQuantity = parseFloat(value);
      if (newQuantity > originalHelperQuantity) {
        newValue = originalHelperQuantity.toString();
      }
    }

    update(index, {
      ...fields[index],
      helper_quantity: newValue,
    });
  };

  return (
    <Input
      value={fields[index].helper_quantity || ""}
      onChange={(e) => handleHelpQuantityChange(index, e.target.value)}
      disabled={!fields[index].included_in_wz}
      className="w-20"
    />
  );
};

export const QuantityChange = ({ index }) => {
  const { control } = useFormContext();
  const { fields, update } = useFieldArray({
    control,
    name: "line_items",
    keyName: "key",
  });

  const handleQuantityChange = (index, value) => {
    const originalQuantity = parseFloat(fields[index].quantity);
    const newQuantity = parseFloat(value);

    if (newQuantity > originalQuantity) {
      update(index, {
        ...fields[index],
        wz_quantity: originalQuantity.toString(),
      });
    } else {
      update(index, { ...fields[index], wz_quantity: value });
    }
  };

  return (
    <Input
      value={fields[index].wz_quantity || ""}
      onChange={(e) => handleQuantityChange(index, e.target.value)}
      disabled={!fields[index].included_in_wz}
      className="w-20"
    />
  );
};
