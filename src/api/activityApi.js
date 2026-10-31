import API from "./axios";

export const getActivitiesByBug = async (bugId) => {

  const response =
    await API.get(
      `/activities/bug/${bugId}`
    );

  return response.data;

};