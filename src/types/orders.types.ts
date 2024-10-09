export enum Status {
  Submitted = "Złożone",
  Awaiting_approval_by_bok = "Oczekuje na zatwierdzenie przez BOK",
  Approved_by_bok = "Zatwierdzone przez BOK",
  Awaiting_payment = "Oczekuje na płatność",
  Payment_approved = "Płatność zatwierdzona",
  In_production = "W trakcie produkcji",
  In_assembly = "W trakcie kompletacji",
  Ready_for_shipping = "Gotowe do wysyłki",
  Shipped = "Wysłane",
  Delivered = "Dostarczone",
  Canceled = "Anulowane",
  Returned = "Zwrócone",
  Closed = "Zamknięte",
  Awaiting_pickup = "Oczekuje na odbiór",
  Rejected_by_bok = "Odrzucone przez BOK",
  Under_verification = "W trakcie weryfikacji",
  Awaiting_raw_materials_availability = "Oczekuje na dostępność surowców",
}

export enum WZType {
  WZS = "WZS",
  WZU = "WZU",
  WZN = "WZN",
}

export enum HelperUnit {
  m3 = "m3",
  m2 = "m2",
  opak = "opak",
  mb = "mb",
  kpl = "kpl",
  kg = "kg",
  szt = "szt",
  t = "t",
}

export enum PalletType {
  Single = "Jednorazowa",
  Euro = "EURO 1200x800",
  Lemar = "LEMAR 1200x800",
}
