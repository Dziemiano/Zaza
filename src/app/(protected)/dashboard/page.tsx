import { auth, signOut } from "@/auth";
import { DashboardCard } from "@/components/dashboard/dashboardCard";

const DashboardPage = async () => {
  const session = await auth();

  return (
    // <div className="flex flex-col pb-5 bg-white">
    //   <div className="flex flex-col px-5 mt-9 w-full max-md:max-w-full">
    //     <div className="flex gap-4 self-start pr-5 text-3xl font-bold text-black">
    //       <img
    //         loading="lazy"
    //         src="https://cdn.builder.io/api/v1/image/assets/TEMP/ad2321d11119440330cff850a10da0919d09594548143e76e1d7aa539cdc7571?"
    //         className="shrink-0 my-auto w-6 aspect-square"
    //       />
    //       <div>Strona główna</div>
    //     </div>
    //     <div className="mt-14 max-md:mt-10 max-md:max-w-full">
    //       <div className="flex gap-5 max-md:flex-col max-md:gap-0">
    //         <div className="flex flex-col w-3/12 max-md:ml-0 max-md:w-full">
    //           <DashboardCard
    //             headerNumber="01"
    //             label="Zamówienia"
    //             href="/orders"
    //           />
    //         </div>
    //         <div className="flex flex-col ml-5 w-9/12 max-md:ml-0 max-md:w-full">
    //           <div className="flex flex-col grow max-md:mt-2 max-md:max-w-full">
    //             <div className="max-md:max-w-full">
    //               <div className="flex gap-5 max-md:flex-col max-md:gap-0">
    //                 <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full"></div>
    //                 <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       03
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Produkty</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //                 <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       04
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Raporty</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //             <div className="mt-2 max-md:max-w-full">
    //               <div className="flex gap-5 max-md:flex-col max-md:gap-0">
    //                 <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow items-start p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       05
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>CRM</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //                 <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       06
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Panel administratora</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //                 <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       07
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Dostawy</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //             <div className="mt-2 max-md:max-w-full">
    //               <div className="flex gap-5 max-md:flex-col max-md:gap-0">
    //                 <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       08
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Załadunek</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //                 <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       09
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Produkcja</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //                 <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       10
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Magazyn</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //             <div className="mt-2 max-md:max-w-full">
    //               <div className="flex gap-5 max-md:flex-col max-md:gap-0">
    //                 <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       11
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Pracownicy</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //                 <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       12
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Analityka</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //                 <div className="flex flex-col ml-5 w-[33%] max-md:ml-0 max-md:w-full">
    //                   <div className="flex flex-col grow items-start p-5 mx-auto w-full whitespace-nowrap bg-white rounded-lg shadow-sm max-md:mt-2">
    //                     <div className="text-5xl text-gray-200 max-md:text-4xl">
    //                       13
    //                     </div>
    //                     <div className="flex gap-2.5 mt-8 text-xl text-black">
    //                       <img
    //                         loading="lazy"
    //                         src="https://cdn.builder.io/api/v1/image/assets/TEMP/21c1eb22e4a2029db40ca043f3c2be25cafccc9e02071bc91207d14a272de0af?"
    //                         className="shrink-0 w-6 aspect-square"
    //                       />
    //                       <div>Flota</div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>

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
              label="Zamowienia"
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
