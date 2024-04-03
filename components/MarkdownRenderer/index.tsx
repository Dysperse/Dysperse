import { blue } from "@/themes";
import { useColorTheme } from "@/ui/color/theme-provider";
import Markdown, { MarkdownProps } from "react-native-markdown-display";

export default function MarkdownRenderer(
  props: MarkdownProps & { children: any }
) {
  const theme = useColorTheme();
  return (
    <Markdown
      style={{
        body: {
          fontFamily: "body_400",
          fontSize: 15,
          color: theme[12],
        },
        link: { color: blue.blue9 },
        image: {
          borderRadius: 20,
          overflow: "hidden",
          objectFit: "cover",
        },
        blockquote: {
          borderLeftColor: theme[9],
          borderLeftWidth: 3,
          paddingHorizontal: 20,
          backgroundColor: "transparent",
          marginVertical: 10,
        },
        bullet_list_icon: {
          width: 5,
          height: 5,
          borderRadius: 99,
          backgroundColor: theme[9],
          color: "transparent",
          marginTop: 8,
        },
        ordered_list_icon: {
          color: theme[11],
        },
      }}
      {...props}
    />
  );
}
