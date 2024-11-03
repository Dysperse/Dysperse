import dayjs from "dayjs";

export const mutations = {
  categoryBased: {
    add: (mutate) => (newTask) => {
      if (!newTask) return;
      if (newTask.parentTaskId) return mutate();

      mutate(
        (oldData) => {
          if (
            oldData.labels.findIndex((l) => l.id === newTask?.label?.id) === -1
          )
            return {
              ...oldData,
              entities: { ...oldData.entities, [newTask.id]: newTask },
            };

          return {
            ...oldData,
            labels: oldData.labels.map((l) =>
              l.id === newTask?.label?.id
                ? { ...l, entities: { ...l.entities, [newTask.id]: newTask } }
                : l
            ),
          };
        },
        { revalidate: false }
      );
    },
    update: (mutate) => (newTask) => {
      if (!newTask) return;
      mutate(
        (oldData) => {
          if (
            newTask?.labelId ||
            (newTask?.parentTaskId &&
              oldData.entities[newTask.parentTaskId]?.labelId)
          ) {
            const newLabels = oldData.labels.map((label: any) => {
              if (
                label.id === newTask?.labelId ||
                (newTask.parentTaskId &&
                  label.id === label.entities[newTask.parentTaskId]?.labelId)
              ) {
                return {
                  ...label,
                  entities: {
                    ...label.entities,
                    [newTask.parentTaskId || newTask.id]: newTask.parentTaskId
                      ? {
                          ...label.entities[newTask.parentTaskId],
                          subtasks: {
                            ...label.entities[newTask.parentTaskId].subtasks,
                            [newTask.id]: newTask,
                          },
                        }
                      : newTask,
                  },
                };
              }
              return label;
            });

            return { ...oldData, labels: newLabels };
          } else {
            return {
              ...oldData,
              entities: {
                ...oldData.entities,
                [newTask.parentTaskId || newTask.id]: newTask.parentTaskId
                  ? {
                      ...oldData.entities[newTask.parentTaskId],
                      subtasks: {
                        ...oldData.entities[newTask.parentTaskId].subtasks,
                        [newTask.id]: newTask,
                      },
                    }
                  : newTask,
              },
            };
          }
        },
        { revalidate: false }
      );
    },
  },

  timeBased: {
    add: (mutate) => (newTask) => {
      if (!newTask) return;
      if (newTask.recurrenceRule || newTask.parentTaskId) return mutate();

      mutate(
        (oldData) => {
          const dateIndex = oldData.findIndex((column) =>
            dayjs(newTask.start).isBetween(
              column.start,
              column.end,
              "day",
              "[]"
            )
          );

          if (dateIndex === -1)
            return [
              ...oldData,
              {
                start: dayjs(newTask.start).startOf("day").toISOString(),
                end: dayjs(newTask.start).endOf("day").toISOString(),
                entities: { [newTask.id]: newTask },
              },
            ];

          return oldData.map((oldColumn, index) => {
            if (index === dateIndex)
              return {
                ...oldColumn,
                entities: { ...oldColumn.entities, [newTask.id]: newTask },
              };
            return oldColumn;
          });
        },
        { revalidate: false }
      );
    },
    update: (mutate) => (newTask) => {
      if (!newTask) return;
      if (newTask.recurrenceRule) return mutate();

      mutate(
        (oldData) => {
          return oldData.map((oldColumn) => {
            // Check if the column contains the parentTaskId
            if (
              newTask.parentTaskId &&
              oldColumn.entities[newTask.parentTaskId]
            ) {
              return {
                ...oldColumn,
                entities: {
                  ...oldColumn.entities,
                  [newTask.parentTaskId]: {
                    ...oldColumn.entities[newTask.parentTaskId],
                    subtasks: {
                      ...oldColumn.entities[newTask.parentTaskId].subtasks,
                      [newTask.id]: newTask,
                    },
                  },
                },
              };
            } else if (
              !newTask.parentTaskId &&
              oldColumn.entities[newTask.id]
            ) {
              // Add new task directly if there is no parentTaskId
              return {
                ...oldColumn,
                entities: {
                  ...oldColumn.entities,
                  [newTask.id]: newTask,
                },
              };
            }

            // Return the column as-is if it doesn't contain the parentTaskId
            return oldColumn;
          });
        },
        { revalidate: false }
      );
    },
  },
};
