import { createContext, useContext } from "react";

interface CollectionContext {
  data: any;
  mutate: any;
  error: any;
}

export const CollectionContext = createContext<CollectionContext>(null);
export type CollectionType =
  | "agenda"
  | "kanban"
  | "stream"
  | "masonry"
  | "grid"
  | "difficulty";
export const useCollectionContext = () => useContext(CollectionContext);
