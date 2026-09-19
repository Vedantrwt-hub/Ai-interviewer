import { Navigate } from "react-router-dom";
import { useAuth } from "../hook/userAuth";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  return children;
};

export default Protected;