import { createContext, useContext } from "react";

export const CollectionSidekickContext = createContext<{
  panelRef: any;
}>(null);
export const useCollectionSidekickContext = () =>
  useContext(CollectionSidekickContext);
