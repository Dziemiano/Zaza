export enum Category {
  Styrofoam = "Styropian",
  Styrofelt = "Styropapa",
  RawMaterial = "Surowiec",
  Sheets = "Formatki",
  ShapedForms = "Kształtki",
  Transport = "Transport",
  Granulate = "Granulat",
  Wool = "Wełna",
  Slant = "Skos",
  Inthermo = "Inthermo",
  Others = "Inne",
}

export type CategoryType = keyof typeof Category;
export type CategoryTypeValues = typeof Category;

export enum ShapeSubcategory {
  ShapedForm = "Kształtka",
  AngleBracket = "Kątownik",
  Profile = "Profil",
  Izoklin = "Izoklin",
  Plug = "Zatyczka",
}

export enum StyrofeltSubcategory {
  OneSide = "Pojedyńczo",
  TwoSide = "Podwójnie",
}

export enum SlopeSubcategory {
  Slant = "Skos",
  Slope = "Spadek",
  Contraslope = "Kontrspadek",
}

export enum EpsTypes {
  EPS045 = "EPS 045",
  EPS045S = "EPS 045 S",
  EPS042 = "EPS 042",
  EPS042S = "EPS 042 S",
  EPS040 = "EPS 040",
  EPS040S = "EPS 040 S",
  EPS070038 = "EPS 070-038",
  EPS070038S = "EPS 070-038 S",
  EPS080038 = "EPS 080-038",
  EPS080038S = "EPS 080-038 S",
  EPS10017S = "EPS 100/17 S",
  EPS100037 = "EPS 100-037",
  EPS100035 = "EPS 100-035",
  EPS120035 = "EPS 120-035",
  EPS150035 = "EPS 150-035",
  EPS200034 = "EPS 200-034",
  EPS100035AQUA = "EPS 100-035 AQUA",
  EPS120035AQUA = "EPS 120-035 AQUA",
  EPS150035AQUA = "EPS 150-035 AQUA",
  EPS200034AQUA = "EPS 200-034 AQUA",
  EPS031GRAFIT = "EPS 031 GRAFIT",
  EPS033GRAFIT = "EPS 033 GRAFIT",
  EPS100030GRAFIT = "EPS 100-030 GRAFIT",
  EPSTAcustic = "EPS T - Akustyczny",
}

export enum RawMaterials {
  FlammableNonConstruction = "Palny/niebudowlany",
  NonFlammableConstruction = "Niepalny/budowlany",
  Fine = "Drobny",
  Coarse = "Gruby",
  FoodGrade = "Spożywczy",
  Graphite = "Grafitowy",
}

export enum PrimaryUnit {
  m2 = "m2",
  m3 = "m3",
  kg = "kg",
  l = "l",
  szt = "szt",
}
