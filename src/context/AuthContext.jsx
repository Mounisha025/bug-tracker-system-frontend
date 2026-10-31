import {
  createContext,
  useEffect,
  useState,
} from "react";

export const AuthContext =
  createContext();

const AuthProvider = ({
  children,
}) => {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // AUTO LOGIN
  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );

    const savedUser =
      localStorage.getItem(
        "user"
      );

    if (token && savedUser) {

      setUser(
        JSON.parse(savedUser)
      );
    }

    setLoading(false);

  }, []);

  // LOGIN
  const login = (
    userData,
    token
  ) => {

    setUser(userData);

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );
  };

  // LOGOUT
  const logout = () => {

    setUser(null);

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );
  };

  return (

    <AuthContext.Provider
      value={{

        user,

        login,

        logout,

        loading,

      }}
    >

      {children}

    </AuthContext.Provider>

  );
};

export default AuthProvider;