import dayjs from "dayjs";

export const getTaskCompletionStatus = (task, dateRange): boolean => {
  if (task.recurrenceRule) {
    return (
      dateRange &&
      task.completionInstances.find((instance) =>
        dayjs(instance.iteration).isBetween(
          dateRange[0],
          dateRange[1],
          "day",
          "[]"
        )
      )
    );
  } else {
    return task.completionInstances.length > 0;
  }
};
