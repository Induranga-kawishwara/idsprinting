export const ConvertToSLT = (utcDateString) => {
  const utcDate = new Date(utcDateString);
  const sltDate = new Date(
    utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
  );

  return {
    date: sltDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    time: sltDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};
