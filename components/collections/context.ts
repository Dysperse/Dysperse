import { createContext, useContext } from "react";
import { KeyedMutator } from "swr";

interface CollectionContext {
  data: any;
  mutate: KeyedMutator<any>;
  error: any;
}

export const CollectionContext = createContext<CollectionContext>(null);
export type CollectionType =
  | "agenda"
  | "kanban"
  | "stream"
  | "grid"
  | "difficulty";
export const useCollectionContext = () => useContext(CollectionContext);
