import { CollectionContext } from "@/components/collections/context";
import { CollectionNavbar } from "@/components/collections/navbar";
import { ContentWrapper } from "@/components/layout/content";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import { Slot, useLocalSearchParams } from "expo-router";
import useSWR from "swr";

export default function Layout() {
  const { id } = useLocalSearchParams();
  const { data, mutate, error } = useSWR(
    id ? ["space/collections/collection", { id }] : null
  );

  return (
    <CollectionContext.Provider value={{ data, mutate, error }}>
      {data ? (
        <ContentWrapper>
          <CollectionNavbar />
          <Slot />
        </ContentWrapper>
      ) : (
        <ContentWrapper
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </ContentWrapper>
      )}
    </CollectionContext.Provider>
  );
}
