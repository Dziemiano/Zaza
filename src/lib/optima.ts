// Constants for API URLs
const API_URLS = {
  WZS: "http://194.150.196.122:6462",
  WZN: "http://194.150.196.122:6463",
};

// Get base URL based on document type
const getBaseUrl = (documentType: string): string | null => {
  if (documentType === "WZU") return null;
  return API_URLS[documentType] || null;
};

export const getOptimaToken = async (
  documentType: string
): Promise<string | null> => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl) return null;

  const response = await fetch(`${baseUrl}/api/Token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: 
      password: 
      grant_type: "password",
    }).toString(),
  });

  const data = await response.json();
  return data.access_token;
};

export const getOptimaDocuments = async (
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  const response = await fetch(`${baseUrl}/api/Documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};

export const getOptimaDocumentsByType = async (
  type: number,
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  try {
    const response = await fetch(`${baseUrl}/api/Documents?type=${type}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if response is 404 - return empty array
    if (response.status === 404) {
      return [];
    }

    // Check for other error status codes
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is empty
    const text = await response.text();
    if (!text) {
      return [];
    }

    try {
      // Try to parse the JSON
      const data = JSON.parse(text);
      // Handle case where response is a single object
      return Array.isArray(data) ? data : [data];
    } catch (parseError) {
      console.error("Failed to parse JSON:", text);
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

export const postOptimaDocument = async (
  document: {
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
  },
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  const response = await fetch(`${baseUrl}/api/Documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    throw new Error(`Error posting document: ${response.statusText}`);
  }

  return await response.json();
};

export const postOptimaItem = async (
  document: any,
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  const response = await fetch(`${baseUrl}/api/Items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(document),
  });

  if (!response.ok) {
    throw new Error(`Error posting product: ${response.statusText}`);
  }

  return await response.json();
};

export const getOptimaItemByCode = async (
  code: string,
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  const response = await fetch(`${baseUrl}/api/Items?code=${code}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return response;
  }

  return await response.json();
};

export const getOptimaCustomerByCode = async (
  code: string,
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  const response = await fetch(`${baseUrl}/api/Customers?code=${code}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return response;
  }

  return await response.json();
};

export const getOptimaCustomerByNip = async (
  nip: string,
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  const response = await fetch(`${baseUrl}/api/Customers?vatNumber=${nip}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return response;
  }

  return await response.json();
};

export const changeOptimaDocumentStatus = async (
  id: number,
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  const response = await fetch(`${baseUrl}/api/DocumentStatus/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: 0 }),
  });

  if (response.status === 404) {
    return response;
  }

  return await response.json();
};

export const postOptimaCustomer = async (
  customerData: {},
  token: string,
  documentType: string
) => {
  const baseUrl = getBaseUrl(documentType);
  if (!baseUrl || !token) return null;

  const response = await fetch(`${baseUrl}/api/Customers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    throw new Error(`Error posting customer: ${response.statusText}`);
  }

  return await response.json();
};
