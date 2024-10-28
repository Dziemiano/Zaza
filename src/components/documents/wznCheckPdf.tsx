import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DeliveryNote from "@/components/documents/wznPdf";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  }
);

type WznCheckPdfProps = { wzData: any; index: any };

export const WzCheckPdf = ({ wzData, index }: WznCheckPdfProps) => {
  console.log(wzData);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="zaza" className="w-[186px] h-7 px-3 py-2">
          Podejrzyj dokument WZ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[70vw] max-h-[90vh] w-full h-full">
        <div className="w-full h-full">
          <PDFViewer width="98%" height="100%">
            <DeliveryNote wzData={wzData} index={index} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
};
