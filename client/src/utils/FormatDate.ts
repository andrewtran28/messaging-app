const monthOptions: Intl.DateTimeFormatOptions = { month: "short" };

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const month = new Intl.DateTimeFormat("en-US", monthOptions).format(dateObj);
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

  return `${month} ${day}, ${year}`;
};

const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const now = new Date();
  const isSameDay =
    dateObj.getFullYear() === now.getFullYear() &&
    dateObj.getMonth() === now.getMonth() &&
    dateObj.getDate() === now.getDate();

  const hours = dateObj.getHours() % 12 || 12;
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const ampm = dateObj.getHours() < 12 ? "AM" : "PM";

  if (isSameDay) {
    return `${hours}:${minutes}${ampm}`;
  } else {
    const month = new Intl.DateTimeFormat("en-US", monthOptions).format(dateObj);
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  }
};

const updateDateTime = (
  createdAt: Date | string | null | undefined,
  updatedAt: Date | string | null | undefined
): string => {
  if (!createdAt || !updatedAt) return "";

  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const updatedDate = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

  const isSameDay =
    createdDate.getFullYear() === updatedDate.getFullYear() &&
    createdDate.getMonth() === updatedDate.getMonth() &&
    createdDate.getDate() === updatedDate.getDate();

  if (!isSameDay) {
    return `(Last updated ${formatDateTime(updatedAt)})`;
  }

  return "";
};

export { formatDate, formatDateTime, updateDateTime };
