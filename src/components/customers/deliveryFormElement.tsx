import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "../ui/checkbox";

type DeliveryAddress = {
  is_construcion_site: boolean;
  street: string;
  building: string;
  premises?: string | null;
  city: string;
  postal_code: string;
  country: string;
};

type DeliveryFormElementProps = {
  name: string;
};

export function DeliveryFormElement({ name }: DeliveryFormElementProps) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const [newDeliveryAddress, setnewDeliveryAddress] = useState<DeliveryAddress>(
    {
      is_construcion_site: false,
      street: "",
      building: "",
      premises: "",
      city: "",
      postal_code: "",
      country: "",
    }
  );

  const addDeliveryAddress = () => {
    if (newDeliveryAddress.street && newDeliveryAddress.building) {
      append(newDeliveryAddress);
      setnewDeliveryAddress({
        is_construcion_site: false,
        street: "",
        building: "",
        premises: "",
        city: "",
        postal_code: "",
        country: "",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <FormField
                control={control}
                name={`${name}.${index}`}
                render={({ field: formField }) => (
                  <Input
                    value={`${
                      formField.value.is_construcion_site ? "Budowa" : ""
                    } ${formField.value.street}  ${formField.value.building} ${
                      formField.value.premises
                    } ${formField.value.city} ${formField.value.postal_code} ${
                      formField.value.country
                    }`}
                    readOnly
                  />
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
              >
                Usuń
              </Button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          <FormField
            control={control}
            name={`${name}.new.is_construcion_site`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormLabel>Budowa?</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={newDeliveryAddress.is_construcion_site}
                    onCheckedChange={(checked: boolean) => {
                      field.onChange(checked);
                      setnewDeliveryAddress((prev) => ({
                        ...prev,
                        is_construcion_site: checked,
                      }));
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none"></div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.street`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ulica</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newDeliveryAddress.street}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewDeliveryAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }));
                    }}
                    placeholder="Ulica"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.building`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nr budynku</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newDeliveryAddress.building}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewDeliveryAddress((prev) => ({
                        ...prev,
                        building: e.target.value,
                      }));
                    }}
                    placeholder="Nr budynku"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.premises`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nr lokalu</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newDeliveryAddress.premises || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewDeliveryAddress((prev) => ({
                        ...prev,
                        premises: e.target.value,
                      }));
                    }}
                    placeholder="Nr lokalu"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.city`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Miejscowość</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newDeliveryAddress.city}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewDeliveryAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }));
                    }}
                    placeholder="Miejscowość"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.postal_code`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod pocztowy</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newDeliveryAddress.postal_code}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewDeliveryAddress((prev) => ({
                        ...prev,
                        postal_code: e.target.value,
                      }));
                    }}
                    placeholder="Kod pocztowy"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.country`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kraj</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newDeliveryAddress.country}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewDeliveryAddress((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }));
                    }}
                    placeholder="Kraj"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            addDeliveryAddress();
          }}
        >
          Dodaj adres dostawy
        </Button>
      </CardContent>
    </Card>
  );
}
