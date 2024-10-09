export enum CommentTypes {
  general = "Ogólne",
  transport = "Dla transportu",
  warehouse = "Dla magazynu",
  production = "Dla produkcji",
}

export type CommentCategory = keyof typeof CommentTypes;

export type Comment = {
  id: string;
  type: CommentCategory;
  body: string;
};
