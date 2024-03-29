"use client";
import { Puller } from "@/components/Puller";
import { addHslAlpha } from "@/lib/client/addHslAlpha";
import { useSession } from "@/lib/client/session";
import { useColor, useDarkMode } from "@/lib/client/useColor";
import {
  Alert,
  Box,
  Button,
  Icon,
  IconButton,
  LinearProgress,
  Skeleton,
  SwipeableDrawer,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import useSWR from "swr";
import { Task } from "../tasks/Task";
import { CreateTask } from "../tasks/Task/Create";
import { SelectionContext } from "../tasks/selection-context";

export function TodaysTasks() {
  const parent = useRef();
  const router = useRouter();
  const { session } = useSession();
  const isDark = useDarkMode(session.darkMode);
  const palette = useColor(session.themeColor, isDark);

  const [open, setOpen] = useState<boolean>(false);

  // react-virtuoso bug!?
  const [_, setRerender] = useState(false);
  useEffect(() => {
    if (open) setRerender((s) => !s);
  }, [open, setRerender]);

  const { data, mutate, error } = useSWR([
    "space/tasks/perspectives",
    {
      start: dayjs().startOf("day").utc().toISOString(),
      end: dayjs().startOf("day").add(1, "day").utc().toISOString(),
      type: "week",
    },
  ]);

  const completedTasksLength = data
    ? data[0]?.tasks?.filter((taskData) =>
        taskData.recurrenceRule !== null
          ? taskData.completionInstances.find((instance) =>
              dayjs(instance.iteration)
                .startOf("day")
                .isSame(dayjs().startOf("day"))
            )
          : taskData.completionInstances?.length > 0
      ).length || 0
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      {!dayjs(session.user.lastPlannedTasks).isToday() && (
        <Box
          className="card"
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
          }}
          onClick={() => router.push("/tasks/plan")}
        >
          <Icon
            className="outlined"
            sx={{
              color: palette[11],
              fontSize: "40px!important",
            }}
          >
            emoji_objects
          </Icon>
          <Box>
            <Typography variant="body2">Stay on top</Typography>
            <Typography sx={{ fontWeight: 700 }} variant="h6">
              Plan my day
            </Typography>
          </Box>
          <Icon sx={{ ml: "auto" }}>arrow_forward_ios</Icon>
        </Box>
      )}
      {data && data.length === 1 && data[0].tasks && (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={() => {
            setOpen(false);
            mutate();
          }}
          PaperProps={{
            sx: {
              maxHeight: "calc(100dvh - 50px)",
              minHeight: "50vh",
            },
            ref: parent,
          }}
        >
          <Puller showOnDesktop />
          <Box sx={{ px: 4 }}>
            <CreateTask
              defaultDate={dayjs().startOf("day").toDate()}
              onSuccess={() => mutate()}
              sx={{ width: "100%" }}
            >
              <Button variant="contained" fullWidth>
                <Icon>add_circle</Icon>New task
              </Button>
            </CreateTask>
          </Box>
          <SelectionContext.Provider
            value={{
              values: [],
              set: () => {},
            }}
          >
            {data[0].tasks.length === 0 && (
              <Box sx={{ p: 4 }}>
                <Alert severity="info">
                  You don&apos;t have any tasks for today!
                </Alert>
              </Box>
            )}
            {data[0].tasks.length !== 0 && (
              <Virtuoso
                data={data[0].tasks}
                initialItemCount={
                  data[0].tasks.length < 10 ? data[0].tasks.length : 10
                }
                itemContent={(i, task) => (
                  <Task
                    recurringInstance={task.recurrenceDay}
                    isAgenda
                    isDateDependent={true}
                    key={task.id}
                    board={task.board || false}
                    columnId={task.column ? task.column.id : -1}
                    mutateList={() => mutate()}
                    task={task}
                  />
                )}
                useWindowScroll
                customScrollParent={parent.current}
              />
            )}
          </SelectionContext.Provider>
        </SwipeableDrawer>
      )}
      {data ? (
        <Box
          onClick={() => setOpen(true)}
          sx={{
            height: "84px",
            p: { xs: 2, sm: 3 },
            borderRadius: 5,
            background: palette[3],
            color: palette[11],
            display: "flex",
            alignItems: "center",
            position: "relative",
            gap: 2,
          }}
        >
          <Icon
            sx={{ zIndex: 1, fontSize: "40px!important" }}
            className="outlined"
          >
            check_circle
          </Icon>
          <Box sx={{ zIndex: 1, minWidth: 0 }}>
            <Typography variant="h5" noWrap>
              {data?.[0]?.tasks?.length} task
              {data?.[0]?.tasks?.length !== 1 && "s"}
            </Typography>
            <Typography variant="body2" noWrap>
              {completedTasksLength} complete
            </Typography>
          </Box>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ ml: "auto", zIndex: 9 }}
          >
            <CreateTask disableBadge>
              <IconButton sx={{ background: addHslAlpha(palette[5], 0.5) }}>
                <Icon>add</Icon>
              </IconButton>
            </CreateTask>
          </Box>
          <LinearProgress
            variant="determinate"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: 5,
              background: "transparent",
              "& *": {
                background: palette[4] + "!important",
              },
            }}
            value={(completedTasksLength / data[0].tasks.length) * 100}
          />
        </Box>
      ) : error ? (
        <Alert sx={{ height: "84px" }}>
          Something went wrong. Please try again later
        </Alert>
      ) : (
        <Skeleton height={84} variant="rectangular" />
      )}
    </motion.div>
  );
}
