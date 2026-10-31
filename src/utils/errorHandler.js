/**
 * Extracts a user-friendly error message from Spring Boot responses or Axios errors
 * @param {any} error
 * @param {string} defaultMessage
 * @returns {string}
 */
export const getErrorMessage = (error, defaultMessage = "An unexpected error occurred") => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (data.message && typeof data.message === "string") {
      return data.message;
    }
    if (data.error && typeof data.error === "string") {
      return data.error;
    }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((err) => err.defaultMessage || err.message || String(err))
        .join(", ");
    }
  }

  if (error?.message) {
    if (error.message === "Network Error") {
      return "Cannot connect to server. Please check your backend connection.";
    }
    return error.message;
  }

  return defaultMessage;
};
