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

type ContactPerson = {
  firstname: string;
  lastname: string;
  phone_number: string;
  email: string;
};
type ContactPersonFormElementProps = {
  name: string;
};

export function ContactPersonFormElement({
  name,
}: ContactPersonFormElementProps) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const [newContactPerson, setNewContactPerson] = useState<ContactPerson>({
    firstname: "",
    lastname: "",
    phone_number: "",
    email: "",
  });

  const addContactPerson = () => {
    if (newContactPerson.firstname && newContactPerson.lastname) {
      append(newContactPerson);
      setNewContactPerson({
        firstname: "",
        lastname: "",
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
                    value={`${formField.value.firstname} ${formField.value.lastname}  ${formField.value.phone_number} ${formField.value.email}`}
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`${name}.new.firstname`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newContactPerson.firstname}
                    onChange={(e) => {
                      field.onChange(e);
                      setNewContactPerson((prev) => ({
                        ...prev,
                        firstname: e.target.value,
                      }));
                    }}
                    placeholder="Imię"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.new.lastname`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwisko</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={newContactPerson.lastname}
                    onChange={(e) => {
                      field.onChange(e);
                      setNewContactPerson((prev) => ({
                        ...prev,
                        lastname: e.target.value,
                      }));
                    }}
                    placeholder="Nazwisko"
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
                    value={newContactPerson.phone_number}
                    onChange={(e) => {
                      field.onChange(e);
                      setNewContactPerson((prev) => ({
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
                    value={newContactPerson.email}
                    onChange={(e) => {
                      field.onChange(e);
                      setNewContactPerson((prev) => ({
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
            addContactPerson();
          }}
        >
          Dodaj osobę kontaktową
        </Button>
      </CardContent>
    </Card>
  );
}
