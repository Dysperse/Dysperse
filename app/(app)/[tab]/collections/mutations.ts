export const mutations = {
  categoryBased: {
    add: (mutate) => (newTask) => {
      if (!newTask) return;
      mutate(
        (data) => {
          if (data.labels.findIndex((l) => l.id === newTask?.label?.id) === -1)
            return {
              ...data,
              entities: { ...data.entities, [newTask.id]: newTask },
            };

          return {
            ...data,
            labels: data.labels.map((l) =>
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
      mutate(
        (oldData) => {
          if (newTask?.labelId) {
            const newLabels = oldData.labels.map((label: any) => {
              if (label.id === newTask?.labelId) {
                return {
                  ...label,
                  entities: { ...label.entities, [newTask.id]: newTask },
                };
              }
              return label;
            });

            return { ...oldData, labels: newLabels };
          } else {
            return {
              ...oldData,
              entities: { ...oldData.entities, [newTask.id]: newTask },
            };
          }
        },
        { revalidate: false }
      );
    },
  },
};
