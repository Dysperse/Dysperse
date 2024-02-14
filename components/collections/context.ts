import { createContext, useContext } from "react";
import { KeyedMutator } from "swr";
import { collectionViews } from "../layout/command-palette/list";

interface CollectionContext {
  data: any;
  mutate: KeyedMutator<any>;
  error: any;
  type: CollectionType;
}

export const CollectionContext = createContext<CollectionContext>(null);
export type CollectionType = keyof typeof collectionViews;
export const useCollectionContext = () => useContext(CollectionContext);
