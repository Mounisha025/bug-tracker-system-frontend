
import API from "./axios";

// Existing email/password login — keep unchanged
export const loginUser = async (loginData) => {
  const response = await API.post(
    "/auth/login",
    loginData
  );

  return response.data;
};

// Google login — sends Google's ID token to Spring Boot
export const loginWithGoogle = async (credential) => {
  const response = await API.post(
    "/auth/google",
    { credential }
  );

  return response.data;
};
