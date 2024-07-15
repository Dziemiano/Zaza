"use server";

import Bir from "bir1";

const bir = new Bir({ key: "db75fdf53eda42ed92b4" });

export const getCustomerFromGus = async (nip: string) => {
  const response = await bir.search({ nip: nip });
  console.log(nip);
  console.log(response);
  return response;
};
