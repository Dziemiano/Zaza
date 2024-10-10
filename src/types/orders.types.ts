export enum CommentOrderTypes {
  general = "Ogólne",
  transport = "Dla transportu",
  warehouse = "Dla magazynu",
  production = "Dla produkcji",
}

export enum CommentProductTypes {
  general = "Ogólne",
}

export type CommentOrderCategory = keyof typeof CommentOrderTypes;

export type CommentProductCategory = keyof typeof CommentProductTypes;

export type CommentCategory = CommentOrderCategory | CommentProductCategory;

export const CommentTypes = { ...CommentProductTypes, ...CommentOrderTypes };

export type Comment = {
  id: string;
  type: CommentCategory;
  body: string;
};
