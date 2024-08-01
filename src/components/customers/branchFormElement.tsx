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

type CompanyBranch = {
  name: string;
  street: string;
  building: string;
  premises?: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone_number?: string;
  email?: string;
};

type BranchFormElementProps = {
  name: string;
};

export function BranchFormElement({ name }: BranchFormElementProps) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const [newBranch, setnewBranch] = useState<CompanyBranch>({
    name: "",
    street: "",
    building: "",
    premises: "",
    city: "",
    postal_code: "",
    country: "",
    phone_number: "",
    email: "",
  });

  const addBranch = () => {
    if (newBranch.name && newBranch.street) {
      append(newBranch);
      setnewBranch({
        name: "",
        street: "",
        building: "",
        premises: "",
        city: "",
        postal_code: "",
        country: "",
        phone_number: "",
        email: "",
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
                    value={`${formField.value.name} ${formField.value.street}  ${formField.value.building} ${formField.value.premises} ${formField.value.city} ${formField.value.postal_code} ${formField.value.country} ${formField.value.phone_number} ${formField.value.email}`}
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
            name={`${name}.new.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newBranch.name}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }}
                    placeholder="Nazwa"
                  />
                </FormControl>
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
                    value={newBranch.street}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
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
                    value={newBranch.building}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
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
                    value={newBranch.premises || ""}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
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
                    value={newBranch.city}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
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
                    value={newBranch.postal_code}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
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
                    value={newBranch.country}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
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
          <FormField
            control={control}
            name={`${name}.new.phone_number`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newBranch.phone_number}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }));
                    }}
                    placeholder="Telefon"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newBranch.email}
                    onChange={(e) => {
                      field.onChange(e);
                      setnewBranch((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                    }}
                    placeholder="Email"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            addBranch();
          }}
        >
          Dodaj filię
        </Button>
      </CardContent>
    </Card>
  );
}
