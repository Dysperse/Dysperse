import dayjs from "dayjs";

export const getTaskCompletionStatus = (task, iteration): boolean => {
  if (task.recurrenceRule) {
    return (
      iteration &&
      task.completionInstances.find(
        (instance) =>
          dayjs(instance.iteration).isValid() &&
          dayjs(instance.iteration).toISOString() ===
            dayjs(iteration.toString()).toISOString()
      )
    );
  } else {
    return task.completionInstances.length > 0;
  }
};
