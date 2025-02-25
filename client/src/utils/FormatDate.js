const formatDateTime = (date) => {
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
    const options = { month: "short" };
    const month = new Intl.DateTimeFormat("en-US", options).format(dateObj);
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year} ${hours}:${minutes}${ampm}`;
  }
};

const updateDateTime = (createdAt, updatedAt) => {
  if (!createdAt || !updatedAt) return "";

  // Convert to Date objects if they are strings
  const createdDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const updatedDate = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);

  // Check if both dates are on the same day
  const isSameDay =
    createdDate.getFullYear() === updatedDate.getFullYear() &&
    createdDate.getMonth() === updatedDate.getMonth() &&
    createdDate.getDate() === updatedDate.getDate();

  // If not the same day, log "hello"
  if (!isSameDay) {
    return `(Last updated ${formatDateTime(updatedAt)})`;
  }

  return "";
};

export { formatDateTime, updateDateTime };
