import { createStyle } from "@gluestack-style/react";

export const AvatarFallbackText = createStyle({
  color: "$primary1",
  overflow: "hidden",
  textTransform: "uppercase",
  _web: {
    cursor: "default",
  },
});
