import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LogTable from "./logsTable";

export interface LogDialogProps {
  entity?: string;
  entity_id?: string;
}

export const LogDialog = ({ entity, entity_id }: LogDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="zazaGrey">Historia</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[60%] min-h-[60%] max-h-[95vh] flex flex-col content-start overflow-y-auto">
        <LogTable entity={entity} entity_id={entity_id} />
      </DialogContent>
      <DialogFooter></DialogFooter>
    </Dialog>
  );
};
