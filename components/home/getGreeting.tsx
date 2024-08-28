export const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  else if (hour < 16) return "Good afternoon";
  else if (hour < 20) return "Good evening";
  else return "Good night";
};
