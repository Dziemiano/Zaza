import { useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { updateOrderEmail } from "@/actions/orders";

export interface EmailContentFormProps {
  order?: z.infer<typeof OrderSchema>;
}

export const EmailContentForm = ({ order }: EmailContentFormProps) => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof OrderSchema>>({
    resolver: zodResolver(OrderSchema),
    reValidateMode: "onChange",
    defaultValues: order
      ? { ...order, id: order.id }
      : {
          personal_collect: false,
          is_paid: false,
          is_proforma: false,
          line_items: [],
          transport_cost: "0",
          email_content: "",
        },
  });

  const onSubmit = (values: z.infer<typeof OrderSchema>) => {
    let formData = new FormData();

    if (values.file) {
      formData.append("file", values.file);
    }

    const data = JSON.parse(JSON.stringify(values));

    const resetForm = () => {
      form.reset({
        personal_collect: false,
        is_paid: false,
        is_proforma: false,
        line_items: [],
        email_content: "",
      });
    };

    startTransition(() => {
      updateOrderEmail(data, formData).then((response) => {
        setSuccess(response?.success);
        setOpen(false);
      });
    });
    setEditMode(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-normal" variant="zazaGrey">
          Korespondecja z klientem
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col h-[70vh] max-w-[70vw]">
        <DialogHeader>
          <Label className="text-lg font-semibold">Treść korespondencji</Label>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <div className="flex-grow overflow-y-auto">
              <FormField
                control={form.control}
                name="email_content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={!editMode}
                        placeholder="Wpisz treść emaila"
                        className="min-h-[200px] w-full resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-auto pt-4">
              <Button
                type="button"
                variant="zaza"
                className="w-[186px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "Anuluj" : "Edytuj"}
              </Button>
              <Button
                variant="zaza"
                className="w-[186px] h-7 px-3 py-2 bg-white rounded-lg shadow justify-center items-center gap-2.5 inline-flex"
                size="sm"
                type={editMode ? "submit" : "button"}
                onClick={editMode ? undefined : () => setOpen(false)}
              >
                {editMode ? "Zapisz" : "Zamknij"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
