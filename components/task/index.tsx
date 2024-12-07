import { useUser } from "@/context/useUser";
import { Avatar } from "@/ui/Avatar";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import React, { memo } from "react";
import { Linking } from "react-native";
import { ImageViewer } from "../ImageViewer";
import { handleLocationPress, isValidHttpUrl } from "./drawer/details";

export const videoChatPlatforms = [
  "zoom.us",
  "meet.google.com",
  "teams.microsoft.com",
  "skype.com",
  "appear.in",
  "gotomeeting.com",
  "webex.com",
  "hangouts.google.com",
  "whereby.com",
  "discord.com",
  "vsee.com",
  "bluejeans.com",
  "join.me",
  "tokbox.com",
  "talky.io",
  "amazonchime.com",
  "viber.com",
];

interface AttachmentChipProps {
  attachments: any[];
  large?: boolean;
  published?: boolean;
}

export const TaskAttachmentChips = memo(
  ({ attachments, large, published }: AttachmentChipProps) => {
    const theme = useColorTheme();

    const getAttachmentIcon = (t) =>
      ({
        LINK: "link",
        FILE: "attachment",
        LOCATION: "location_on",
      }[t]);

    const { session } = useUser();
    const isVideoChatPlatform = (t) =>
      videoChatPlatforms.some((platform) => t?.includes?.(platform));

    return attachments.map((attachment) => (
      <ImageViewer
        key={attachment.data + attachment.type}
        image={attachment.type === "IMAGE" && attachment.data}
      >
        <Chip
          dense={!large}
          label={
            attachment.name ||
            (attachment.type === "LINK"
              ? isVideoChatPlatform(attachment.data)
                ? "Join meeting"
                : isValidHttpUrl(attachment.data?.val || attachment.data)
                ? new URL(attachment.data?.val || attachment.data).hostname
                : "Link"
              : attachment.type === "LOCATION"
              ? "Maps"
              : "File")
          }
          onPress={() => {
            if (attachment.type === "LINK") {
              Linking.openURL(attachment.data);
            } else if (attachment.type === "LOCATION") {
              handleLocationPress(session, attachment);
            }
          }}
          icon={
            attachment.type === "IMAGE" ? (
              <Avatar size={22} image={attachment.data} disabled />
            ) : isVideoChatPlatform(attachment.data) ? (
              "call"
            ) : (
              getAttachmentIcon(attachment.type)
            )
          }
          style={[{ padding: 5 }, published && { backgroundColor: theme[5] }]}
        />
      </ImageViewer>
    ));
  }
);

export const TaskImportantChip = ({
  large,
  published,
}: {
  large?: boolean;
  published?: boolean;
}) => {
  const orange = useColor("orange");
  return (
    <Chip
      dense={!large}
      disabled
      label="Urgent"
      icon={
        <Icon size={large ? 24 : 22} style={{ color: orange[11] }}>
          priority_high
        </Icon>
      }
      style={{ backgroundColor: orange[published ? 4 : 6] }}
      color={orange[11]}
    />
  );
};
export const TaskLabelChip = ({
  task,
  published = false,
  large = false,
}: {
  task: any;
  published?: boolean;
  large?: boolean;
}) => {
  const theme = useColor(task.label.color);

  return (
    <Chip
      disabled
      dense={!large}
      label={
        large
          ? task.label.name
          : task.label.name.length > 10
          ? `${task.label.name.slice(0, 10)}...`
          : `${task.label.name}`
      }
      colorTheme={task.label.color}
      icon={<Emoji size={large ? 23 : 17} emoji={task.label.emoji} />}
      style={[
        {
          paddingHorizontal: 10,
        },
        published && {
          backgroundColor: theme[4],
        },
      ]}
    />
  );
};

export function getPreviewText(htmlString) {
  if (!htmlString) return "";
  // Use a regular expression to remove all tags and their contents (e.g., <img>)
  const strippedString = htmlString.replace(/<\/?[^>]+(>|$)/g, "");

  // Trim the string to a desired length for a preview, e.g., 150 characters
  const previewLength = 150;
  return strippedString.length > previewLength
    ? strippedString.substring(0, previewLength) + "..."
    : strippedString;
}

export default React.memo(Task);

