import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Icon from "@/ui/Icon";
import { MenuItem } from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { memo, useState } from "react";
import Toast from "react-native-toast-message";
import LabelPicker from "../../labels/picker";
import { useCollectionContext } from "../context";

export const CollectionLabelMenu = memo(function CollectionLabelMenu() {
  const { data, mutate } = useCollectionContext();
  const { session } = useSession();
  const [labels, setLabels] = useState(data?.labels?.map((i) => i.id) || []);

  const handleSave = async () => {
    try {
      if (labels === data.labels.map((i) => i.id)) return;
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
      hideBack
      sheetProps={
        {
          // enablePanDownToClose: false,
          // disableBackToClose: true,
          // disableEscapeToClose: true,
          // disableBackdropPressToClose: true,
        }
      }
      autoFocus={false}
      label={labels}
      setLabel={setLabels}
      onClose={handleSave}
    >
      <MenuItem>
        <Icon>label</Icon>
        <Text variant="menuItem" weight={300}>
          Edit labels
        </Text>
      </MenuItem>
    </LabelPicker>
  );
});
