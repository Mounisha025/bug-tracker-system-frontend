import API from "../api/axios";

export const getNotifications = async (userId) => {
  const response = await API.get(`/notifications/${userId}`);
  return response.data;
};

export const markAllAsRead = async (userId) => {
  const response = await API.put(`/notifications/${userId}/read-all`);
  return response.data;
};

export default {
  getNotifications,
  markAllAsRead,
};
