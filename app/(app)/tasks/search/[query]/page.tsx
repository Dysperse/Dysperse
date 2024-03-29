"use client";

import { SearchTasks } from "@/app/(app)/tasks/Layout/SearchTasks";
import { Task } from "@/app/(app)/tasks/Task";
import { ErrorHandler } from "@/components/Error";
import {
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { Virtuoso } from "react-virtuoso";
import useSWR from "swr";
import { TaskNavbar } from "../../navbar";

export default function Page() {
  const scrollParentRef = useRef();
  const isMobile = useMediaQuery("(max-width: 600px)");
  const params = useParams();
  const { query: _query } = params as any;
  const query = _query
    ? JSON.parse(decodeURIComponent(_query.toString()))
    : null;

  const { data, error, mutate } = useSWR([
    "space/tasks/search",
    { query: JSON.stringify(query) },
  ]);

  return (
    <>
      <TaskNavbar closeIcon="arrow_back_ios_new">
        <SearchTasks inputOnly />
      </TaskNavbar>
      <Box
        sx={{
          maxWidth: "500px",
          px: { sm: 2 },
          mx: "auto",
          mt: { xs: 15, sm: 10 },
        }}
      >
        <Box sx={{ pb: 10 }}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h2" className="font-heading">
              Search results
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.6 }}>
              {data?.data?.length || 0} items
            </Typography>
          </Box>
          {error && <ErrorHandler />}
          {data ? (
            <Virtuoso
              useWindowScroll
              customScrollParent={
                isMobile ? undefined : scrollParentRef.current
              }
              data={data.data}
              itemContent={(_, task) =>
                task && (
                  <Task
                    isAgenda
                    isDateDependent={true}
                    key={task.id}
                    isScrolling={false}
                    board={task?.board || false}
                    columnId={task.column ? task.column.id : -1}
                    mutate={() => {}}
                    mutateList={mutate}
                    task={task}
                  />
                )
              }
            />
          ) : (
            <Box
              sx={{ px: 3, display: "flex", justifyContent: "center", mt: 3 }}
            >
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
