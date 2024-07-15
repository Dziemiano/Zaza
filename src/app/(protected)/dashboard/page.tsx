import { auth, signOut } from "@/auth";
import { DashboardCard } from "@/components/dashboard/dashboardCard";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="flex flex-col pb-5 bg-white">
      <div className="flex flex-col px-5 mt-9 w-full max-md:max-w-full">
        <div className="flex gap-3 self-start pr-5 text-3xl font-bold text-black">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/ad2321d11119440330cff850a10da0919d09594548143e76e1d7aa539cdc7571?"
            className="shrink-0 my-auto w-6 aspect-square"
          />
          <div>Strona główna</div>
        </div>
        <div className="grid grid-cols-4 gap-5 grid-rows-4 max-h-screen mt-5">
          <div className="row-span-4">
            <DashboardCard
              headerNumber="01"
              label="Zamówienia"
              href="/orders"
            />
          </div>
          <DashboardCard headerNumber="02" label="Klienci" href="/customers" />
          <DashboardCard headerNumber="03" label="Produkty" href="/products" />
          <DashboardCard headerNumber="04" label="Raporty" href="/reports" />
          <DashboardCard headerNumber="05" label="CRM" href="/crm" />
          <DashboardCard
            headerNumber="06"
            label="Panel Administratora"
            href="/admin"
          />
          <DashboardCard headerNumber="07" label="Dostawy" href="/deliveries" />
          <DashboardCard headerNumber="08" label="Załadunek" href="/carloads" />
          <DashboardCard
            headerNumber="09"
            label="Produkcja"
            href="/production"
          />
          <DashboardCard headerNumber="10" label="Magazyn" href="/warehouse" />
          <DashboardCard
            headerNumber="11"
            label="Pracownicy"
            href="/employees"
          />
          <DashboardCard
            headerNumber="12"
            label="Analityka"
            href="/analytics"
          />
          <DashboardCard headerNumber="13" label="Flota" href="/fleet" />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
