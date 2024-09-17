import { createContext, useContext } from "react";
import { KeyedMutator } from "swr";
import { COLLECTION_VIEWS } from "../layout/command-palette/list";

export interface CollectionContext {
  data: any;
  mutate: KeyedMutator<any>;
  error: any;
  type: CollectionType;
  swrKey: any[];
  openLabelPicker?: () => void;
  isPublic?: boolean;
  access: null | {
    id: string;
    hasSeen: boolean;
    access: "READ_ONLY" | "EDITOR" | "MODERATOR";
    user: any;
    collection: any;
    userId: string;
    collectionId: string;
  };
}

export const CollectionContext = createContext<CollectionContext>(null);
export type CollectionType = keyof typeof COLLECTION_VIEWS;
export const useCollectionContext = () => useContext(CollectionContext);

