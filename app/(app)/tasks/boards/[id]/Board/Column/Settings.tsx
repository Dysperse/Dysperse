"use client";

import { SelectionContext } from "@/app/(app)/tasks/selection-context";
import { Puller } from "@/components/Puller";
import { useSession } from "@/lib/client/session";
import { useAccountStorage } from "@/lib/client/useAccountStorage";
import { fetchRawApi } from "@/lib/client/useApi";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import { vibrate } from "@/lib/client/vibration";
import {
  Box,
  Button,
  Divider,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  SwipeableDrawer,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  cloneElement,
  useCallback,
  useContext,
  useDeferredValue,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { BoardContext, ColumnContext } from "..";
import { ConfirmationModal } from "../../../../../../../components/ConfirmationModal";
import EmojiPicker from "../../../../../../../components/EmojiPicker";

export function ColumnSettings({
  children,
  tasks,
}: {
  children: JSX.Element;
  tasks: any[];
}) {
  const storage = useAccountStorage();
  const ref: any = useRef();
  const buttonRef: any = useRef();
  const router = useRouter();
  const { session } = useSession();
  const palette = useColor(session.themeColor, useDarkMode(session.darkMode));

  const { board, mutateData } = useContext(BoardContext);
  const { column, length } = useContext(ColumnContext);
  const selection = useContext(SelectionContext);

  const isMobile = useMediaQuery("(max-width: 600px)");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [title, setTitle] = useState(column.name);
  const [emoji, setEmoji] = useState(column.emoji);
  const [open, setOpen] = useState<boolean>(false);

  const deferredTitle = useDeferredValue(title);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      vibrate(50);
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const isDark = useDarkMode(session.darkMode);
  const handleModalClose = () => {
    mutateData();
    setOpen(false);
  };

  const trigger = cloneElement(children || <div />, { onClick: handleClick });

  const menuChildren = (
    <Box
      sx={{
        "& .MuiMenuItem-root": {
          gap: 2,
        },
      }}
    >
      <MenuItem
        onClick={() => {
          selection.set(["-1"]);
          handleClose();
        }}
      >
        <Icon className="outlined">select</Icon>Select
      </MenuItem>
      <MenuItem
        onClick={() => {
          selection.set(tasks.map((t) => t.id));
          handleClose();
        }}
      >
        <Icon className="outlined">select_all</Icon>Select all
      </MenuItem>
      <MenuItem
        onClick={() => {
          router.push(`/tasks/boards/edit/${board.id}#columns`);
          handleClose();
        }}
      >
        <Icon className="outlined">swipe</Icon>Reorder columns
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={async () => {
          handleClose();
          await mutateData();
          toast.success("Refreshed!");
        }}
      >
        <Icon className="outlined">refresh</Icon>
        Refresh
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={() => setOpen(true)}
        disabled={
          storage?.isReached === true || session.permission === "read-only"
        }
      >
        <Icon className="outlined">edit</Icon>
        Edit
      </MenuItem>
      <ConfirmationModal
        title="Delete column?"
        question="Are you sure you want to delete this column? This action annot be undone."
        callback={async () => {
          await fetchRawApi(session, "space/tasks/boards/column", {
            method: "DELETE",
            params: {
              id: column.id,
              who: session.user.name,
              boardName: board.name,
              boardEmoji: board.emoji,
              columnName: column.name,
            },
          });
          await mutateData();
          handleClose();
        }}
      >
        <MenuItem disabled={session.permission === "read-only"}>
          <Icon className="outlined">delete</Icon>
          Delete
        </MenuItem>
      </ConfirmationModal>
    </Box>
  );

  return column.name === "" ? null : (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        sx={{
          zIndex: 9999999,
        }}
        onClose={handleModalClose}
        PaperProps={{
          sx: {
            maxWidth: "400px",
            maxHeight: "400px",
            width: "auto",
          },
        }}
        variant="outlined"
      >
        <Puller showOnDesktop />
        <EmojiPicker setEmoji={setEmoji}>
          <IconButton
            size="large"
            sx={{
              mx: "auto",
              my: 2,
              border: "2px dashed #ccc",
              width: 120,
              height: 120,
            }}
          >
            <img
              width={40}
              height={40}
              alt="Emoji"
              src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emoji}.png`}
            />
          </IconButton>
        </EmojiPicker>
        <TextField
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
          id={"renameInput"}
          inputRef={ref}
          disabled={storage?.isReached === true}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              buttonRef.current.click();
            }
          }}
          InputProps={{ sx: { fontWeight: 700 } }}
          placeholder="Column name"
        />
        <Button
          ref={buttonRef}
          size="large"
          variant="contained"
          sx={{ mt: 2 }}
          disabled={
            storage?.isReached === true ||
            deferredTitle.trim() == "" ||
            deferredTitle.length > 25
          }
          onClick={async () => {
            toast.promise(
              fetchRawApi(session, "space/tasks/boards/column", {
                method: "PUT",
                params: {
                  id: column.id,
                  name: title,
                  emoji: emoji,
                },
              }).then(mutateData),
              {
                loading: "Saving...",
                success: "Edited column!",
                error: "Yikes! An error occured - Please try again later!",
              }
            );
            setOpen(false);
          }}
        >
          Done <Icon className="outlined">check</Icon>
        </Button>
      </SwipeableDrawer>
      {children ? (
        trigger
      ) : (
        <IconButton
          onClick={handleClick}
          size="large"
          sx={{
            ...(Boolean(anchorEl) && {
              background: `${
                isDark ? "hsla(240,11%,25%, 0.3)" : "rgba(0,0,0,0.05)"
              }!important`,
              color: isDark ? "#fff!important" : "#000!important",
            }),
          }}
        >
          <Icon className="outlined">expand_circle_down</Icon>
        </IconButton>
      )}

      {isMobile ? (
        <SwipeableDrawer
          onClick={(e) => e.stopPropagation()}
          anchor="bottom"
          open={Boolean(anchorEl)}
          onClose={handleClose}
          keepMounted
          PaperProps={{ keepMounted: true }}
        >
          <Puller />
          <Box
            sx={{ px: 2, mb: 2, display: "flex", gap: 2, alignItems: "center" }}
          >
            <img
              width={40}
              height={40}
              src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${column.emoji}.png`}
              alt="Emoji"
            />

            <Box>
              <Typography variant="h6">{column.name}</Typography>
              <Typography>
                {length} item{length !== 1 && "s"}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 1 }} />
          {menuChildren}
        </SwipeableDrawer>
      ) : (
        <Menu
          onClick={(event) => event.stopPropagation()}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          keepMounted
        >
          {menuChildren}
        </Menu>
      )}
    </>
  );
}
