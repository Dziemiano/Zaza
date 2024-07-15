"use server";

import { logEvent } from "./logs";

export async function checkNIP(nip: string) {
  const date = new Date().toISOString().slice(0, 10);
  const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${date}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    await logEvent({
      entity: "nip",
      entity_id: nip,
      eventType: "check_positive",
    });

    const data = await response.json();
    return data.result;
  } catch (error) {
    await logEvent({
      entity: "nip",
      entity_id: nip,
      eventType: "check_negative",
    });
    console.error("Error fetching NIP data:", error.message);
    throw new Error(`Failed to fetch NIP data: ${error.message}`);
  }
}
