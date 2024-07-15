export const getOptimaToken = async () => {
  const response = await fetch("http://194.150.196.122:6462/api/Token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: "drimple",
      password: "nV91E1#3p3g7eI!#M*f82p6fsC",
      grant_type: "password",
    }).toString(),
  });

  const data = await response.json();
  return data.access_token;
};

export const getOptimaDocuments = async () => {
  const token = await getOptimaToken();
  const response = await fetch("http://194.150.196.122:6462/api/Documents", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};

export const postOptimaDocument = async (document: {
  type: number;
  foreignNumber: string;
  calculatedOn: number;
  paymentMethod: string;
  currency: string;
  elements: Array<{
    itemId: number;
    code: string;
    manufacturerCode: string;
    unitNetPrice: number;
    unitGrossPrice: number;
    totalNetValue: number;
    totalGrossValue: number;
    quantity: number;
    vatRate: number;
    setCustomValue: boolean;
  }>;
  description: string;
  status: number;
  sourceWarehouseId: number;
  documentSaleDate: string;
  documentIssueDate: string;
  documentPaymentDate: string;
  symbol: string;
  series?: string;
  number: number;
}) => {
  const token = await getOptimaToken();
  console.log(token);
  const response = await fetch("http://194.150.196.122:6462/api/Documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify(document),
  });

  const data = await response.json();
  return data;
};
