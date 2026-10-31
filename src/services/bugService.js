import API from "../api/axios";

export const getBugs = async () => {
  const response = await API.get("/bugs");
  return response.data;
};

export const createBug = async (bugData) => {
  const response = await API.post("/bugs", bugData);
  return response.data;
};

export const updateBug = async (id, bugData) => {
  const response = await API.put(`/bugs/${id}`, bugData);
  return response.data;
};

export const deleteBug = async (id) => {
  const response = await API.delete(`/bugs/${id}`);
  return response.data;
};

export const uploadScreenshot = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post("/bugs/upload", formData);
  return response.data;
};

export default {
  getBugs,
  createBug,
  updateBug,
  deleteBug,
  uploadScreenshot,
};
