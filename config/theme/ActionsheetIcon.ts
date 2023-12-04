import { createStyle } from "@gluestack-style/react";

export const ActionsheetIcon = createStyle({
  props: {
    size: "sm",
  },
  color: "$primary5",
  _dark: {
    //@ts-ignore
    color: "$backgroundDark400",
  },
});
