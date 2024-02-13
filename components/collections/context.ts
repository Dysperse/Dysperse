import { createContext, useContext } from "react";
import { KeyedMutator } from "swr";

interface CollectionContext {
  data: any;
  mutate: KeyedMutator<any>;
  error: any;
  type: CollectionType;
}

export const CollectionContext = createContext<CollectionContext>(null);
export type CollectionType =
  | "agenda"
  | "kanban"
  | "stream"
  | "grid"
  | "workload"
  | "matrix";
export const useCollectionContext = () => useContext(CollectionContext);
