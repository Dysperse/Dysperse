import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import { showErrorToast } from "@/utils/errorToast";
import { memo, useState } from "react";
import { toast } from "sonner-native";
import LabelPicker from "../../labels/picker";
import { useCollectionContext } from "../context";

export const CollectionLabelMenu = memo(function CollectionLabelMenu({
  children,
  sheetRef,
}: {
  children?: React.ReactNode;
  sheetRef?: any;
}) {
  const { data, mutate, openLabelPicker } = useCollectionContext();
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
      toast.success("Saved!");
    } catch (e) {
      showErrorToast();
    }
  };

  return (
    <LabelPicker
      multiple
      sheetProps={{ sheetRef }}
      hideBack
      label={labels}
      setLabel={setLabels}
      onClose={handleSave}
    >
      {(children as any) || (
        <Button
          icon="label"
          onPress={openLabelPicker}
          text="Add labels..."
          variant="filled"
        />
      )}
    </LabelPicker>
  );
});

