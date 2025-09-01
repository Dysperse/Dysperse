import dayjs from "dayjs";

export const mutations = {
  categoryBased: {
    add: (mutate) => (newTask) => {
      try {
        if (!newTask) return;
        if (newTask.parentTaskId) return mutate();

        mutate(
          (oldData) => {
            const labelId = newTask.parentTaskId
              ? oldData.entities[newTask.parentTaskId]?.labelId
              : newTask.labelId;

            if (!labelId)
              return {
                ...oldData,
                entities: { ...oldData.entities, [newTask.id]: newTask },
              };

            return {
              ...oldData,
              labels: oldData.labels.map((l) =>
                l.id === labelId
                  ? {
                      ...l,
                      entities: {
                        ...l.entities,
                        [newTask.id]: newTask.parentTaskId
                          ? oldData.entities[newTask.parentTaskId]
                          : newTask,
                      },
                    }
                  : l
              ),
            };
          },
          { revalidate: false }
        );
      } catch (e) {
        console.error(e);
        return mutate();
      }
    },
    update: (mutate) => (newTask) => {
      try {
        if (!newTask) return;
        mutate(
          (oldData) => {
            const labelId =
              newTask?.labelId ||
              oldData.labels.find(
                (label) => label.entities[newTask.parentTaskId]
              )?.id;

            if (labelId) {
              return {
                ...oldData,
                labels: oldData.labels.map((label) => {
                  if (label.id === labelId) {
                    return {
                      ...label,
                      entities: newTask.parentTaskId
                        ? {
                            ...label.entities,
                            [newTask.parentTaskId]: {
                              ...label.entities[newTask.parentTaskId],
                              subtasks: {
                                ...label.entities[newTask.parentTaskId]
                                  .subtasks,
                                [newTask.id]: newTask,
                              },
                            },
                          }
                        : {
                            ...label.entities,
                            [newTask.id]: newTask,
                          },
                    };
                  }
                  return label;
                }),
              };
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
      } catch (e) {
        console.error(e);
        return mutate();
      }
    },
  },

  timeBased: {
    add: (mutate) => (newTask) => {
      try {
        if (!newTask) return;
        if (newTask.recurrenceRule) return mutate();

        mutate(
          (oldData) => {
            const columnIndex = oldData.findIndex((column) =>
              dayjs(
                newTask.parentTaskId
                  ? oldData.entities[newTask.parentTaskId]?.start
                  : newTask.start
              ).isBetween(column.start, column.end, "day", "[]")
            );

            if (columnIndex === -1) return;

            return oldData.map((oldColumn, index) => {
              if (index === columnIndex)
                return {
                  ...oldColumn,
                  entities: {
                    ...oldColumn.entities,
                    [newTask.parentTaskId || newTask.id]: newTask.parentTaskId
                      ? {
                          // all the other properties of the parent task
                          ...oldColumn.entities[newTask.parentTaskId],

                          // all the subtasks of the parent task
                          subtasks: {
                            ...oldColumn.entities[newTask.parentTaskId]
                              .subtasks,

                            // Updated task
                            [newTask.id]: newTask,
                          },
                        }
                      : newTask,
                  },
                };
              return oldColumn;
            });
          },
          { revalidate: false }
        );
      } catch (e) {
        console.error(e);
        return mutate();
      }
    },
    update: (mutate) => (newTask) => {
      try {
        if (!newTask) {
          console.log("couldn't find task");
          return;
        }
        if (newTask.recurrenceRule || newTask.parentTaskId) return mutate();

        mutate(
          (oldData) => {
            const colIndex = oldData.findIndex((column) =>
              dayjs(
                newTask.parentTaskId
                  ? column.entities[newTask.parentTaskId]?.start
                  : newTask.start
              ).isBetween(column.start, column.end, "day", "[]")
            );

            return oldData.map((oldColumn, index) => {
              if (index === colIndex) {
                return {
                  ...oldColumn,
                  entities: {
                    ...oldColumn.entities,
                    [newTask.parentTaskId || newTask.id]: newTask.parentTaskId
                      ? {
                          ...oldColumn.entities[newTask.parentTaskId],
                          subtasks: {
                            ...oldColumn.entities[newTask.parentTaskId]
                              .subtasks,
                            [newTask.id]: newTask,
                          },
                        }
                      : newTask,
                  },
                };
              }
              return oldColumn;
            });
          },
          { revalidate: false }
        );
      } catch (e) {
        console.error(e);
        return mutate();
      }
    },
  },
};

