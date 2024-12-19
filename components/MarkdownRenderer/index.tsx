import { blue } from "@/themes";
import { useColorTheme } from "@/ui/color/theme-provider";
import { getFontName } from "@/ui/Text";
import Markdown, { MarkdownProps } from "react-native-markdown-display";

export default function MarkdownRenderer(
  props: MarkdownProps & { children: any }
) {
  const theme = useColorTheme();
  return (
    <Markdown
      style={{
        body: {
          fontFamily: getFontName("jost", 400),
          fontSize: 15,
          color: theme[12],
          pointerEvents: "none",
        },
        link: { color: blue.blue9, pointerEvents: "auto" },
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
        code_inline: {
          backgroundColor: theme[5],
          padding: 0,
          borderColor: theme[7],
          borderRadius: 4,
          fontFamily: "mono",
        },
      }}
      {...props}
    />
  );
}

