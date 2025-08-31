import dayjs from "dayjs";

export const mutations = {
  categoryBased: {
    add: (mutate) => (newTask) => {
      try {
        if (!newTask) return;
        if (newTask.parentTaskId) return mutate();

        mutate(
          (oldData) => {
            if (
              !newTask?.label ||
              oldData.labels.findIndex((l) => l.id === newTask?.label?.id) ===
                -1
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
              const newLabels = oldData.labels.map((label: any) => {
                if (label.id === labelId) {
                  return {
                    ...label,
                    entities: {
                      ...label.entities,
                      [newTask.parentTaskId || newTask.id]: newTask.parentTaskId
                        ? {
                            ...label.entities[newTask.parentTaskId],
                            subtasks: {
                              ...label.entities[newTask.parentTaskId].subtasks,
                              [newTask.parentTaskId]: newTask,
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

        console.log(newTask);

        mutate(
          (oldData) => {
            const dateIndex = oldData.findIndex((column) =>
              dayjs(
                newTask.parentTaskId
                  ? oldData.entities[newTask.parentTaskId]?.start
                  : newTask.start
              ).isBetween(column.start, column.end, "day", "[]")
            );

            if (dateIndex === -1) return;

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
      } catch (e) {
        console.error(e);
        return mutate();
      }
    },
    update: (mutate) => (newTask) => {
      try {
        if (!newTask) return;
        if (newTask.recurrenceRule) return mutate();

        mutate(
          (oldData) => {
            const colIndex = oldData.findIndex((column) =>
              dayjs(
                newTask.parentTaskId
                  ? column.entities[newTask.parentTaskId]?.start
                  : newTask.start
              ).isBetween(column.start, column.end, "day", "[]")
            );

            return oldData.map((oldColumn, oldColumnIndex) => {
              if (newTask.parentTaskId && oldColumnIndex === colIndex) {
                // Update task in the parent column if it has a parentTaskId
                return {
                  ...oldColumn,
                  entities: {
                    ...oldColumn.entities,
                    [newTask.parentTaskId]: {
                      ...oldColumn.entities[newTask.parentTaskId],
                      subtasks: {
                        [newTask.id]: newTask,
                      },
                    },
                  },
                };
              } else if (!newTask.parentTaskId && oldColumnIndex === colIndex) {
                // Add new task directly if there is no parentTaskId
                return {
                  ...oldColumn,
                  entities: {
                    ...oldColumn.entities,
                    [newTask.id]: newTask,
                  },
                };
              }

              const { [newTask.id]: _, ...restEntities } = oldColumn.entities;
              return { ...oldColumn, entities: restEntities };
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

