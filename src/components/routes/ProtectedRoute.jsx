import {
  useContext,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  AuthContext,
} from "../../context/AuthContext";

const ProtectedRoute = ({
  children,
}) => {

  const {

    user,

    loading,

  } = useContext(AuthContext);

  // LOADING
  if (loading) {

    return (
      <div className="text-white p-10">
        Loading...
      </div>
    );
  }

  // NOT LOGGED IN
  if (!user) {

    return (
      <Navigate to="/login" />
    );
  }

  // AUTHORIZED
  return children;
};

export default ProtectedRoute;