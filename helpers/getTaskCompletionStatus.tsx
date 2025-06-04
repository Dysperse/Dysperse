import dayjs from "dayjs";

export const getTaskCompletionStatus = (task, iteration): boolean => {
  if (task.recurrenceRule) {
    if (!iteration) return false;
    return task.completionInstances.some(
      (instance) =>
        dayjs(instance.iteration || instance.recurrenceDay).isValid() &&
        dayjs(instance.iteration || instance.recurrenceDay).toISOString() ===
          dayjs(iteration.toString()).toISOString()
    );
  } else {
    return task.completionInstances.length > 0;
  }
};

