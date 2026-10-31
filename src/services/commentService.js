import API from "../api/axios";

export const getCommentsByBug = async (bugId) => {
  const response = await API.get(`/comments/bug/${bugId}`);
  return response.data;
};

export const addComment = async (commentData) => {
  const response = await API.post("/comments", commentData);
  return response.data;
};

export default {
  getCommentsByBug,
  addComment,
};
