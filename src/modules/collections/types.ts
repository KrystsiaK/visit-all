export interface Collection {
  id: string;
  name: string;
  color: string;
  icon: string;
  itemCount: number;
}

export type InteractionMode = "pin" | "trace" | "area" | "editTrace" | "editArea" | "editPin";
