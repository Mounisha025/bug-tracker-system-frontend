
import API from "../api/axios";

export const getUsers = async () => {
  const response = await API.get("/users");
  return response.data;
};

export const createUser = async (userData) => {
  const response = await API.post("/users", userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await API.delete(`/users/${id}`);
  return response.data;
};

export default {
  getUsers,
  createUser,
  deleteUser,
};
