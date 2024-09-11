import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import { memo, useState } from "react";
import Toast from "react-native-toast-message";
import LabelPicker from "../../labels/picker";
import { useCollectionContext } from "../context";

export const CollectionLabelMenu = memo(function CollectionLabelMenu({
  onOpen,
  children,
  sheetRef,
}: {
  onOpen?: () => void;
  children?: React.ReactNode;
  sheetRef?: any;
}) {
  const { data, mutate } = useCollectionContext();
  const { session } = useSession();
  const [labels, setLabels] = useState(data?.labels?.map((i) => i.id) || []);

  const handleSave = async () => {
    try {
      if (labels === (data?.labels?.map((i) => i.id) || [])) return;
      await sendApiRequest(
        session,
        "PUT",
        "space/collections",
        {},
        {
          body: JSON.stringify({ labels, id: data.id, gridOrder: labels }),
        }
      );
      await mutate();
      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Something went wrong" });
    }
  };

  return (
    <LabelPicker
      multiple
      sheetProps={{ sheetRef }}
      hideBack
      label={labels}
      setLabel={setLabels}
      onOpen={onOpen}
      onClose={handleSave}
    >
      {(children as any) || (
        <Button
          icon="label"
          onPress={onOpen}
          text="Add labels..."
          variant="filled"
        />
      )}
    </LabelPicker>
  );
});

