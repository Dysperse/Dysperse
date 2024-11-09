import { useCollectionContext } from "@/components/collections/context";
import { CollectionMenuLayout } from "@/components/collections/menus/layout";
import { CollectionInfo } from "@/components/collections/navbar/CollectionInfo";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import { router } from "expo-router";
import { View } from "react-native";
import { mutate } from "swr";

function Content() {
  const { session } = useSession();
  const collection = useCollectionContext();
  useHotkeys("esc", () => router.back());

  return (
    <>
      <View style={{ flex: 1 }}>
        <View>
          <CollectionInfo collection={collection} navigation={{}} />
          <ConfirmationModal
            height={450}
            onSuccess={async () => {
              await sendApiRequest(session, "DELETE", "space/collections", {
                id: collection.data.id,
              });
              router.replace("/home");
              await mutate(() => true);
            }}
            title="Delete collection?"
            secondary="This won't delete any labels or its contents. Any opened views with this collection will be closed"
          >
            <Button
              variant="filled"
              height={60}
              bold
              containerStyle={{ marginBottom: 40, marginTop: 20 }}
              icon="delete"
              text="Delete collection"
            />
          </ConfirmationModal>
        </View>
      </View>
    </>
  );
}

export default function Page() {
  return (
    <CollectionMenuLayout title="Customize">
      <Content />
    </CollectionMenuLayout>
  );
}

