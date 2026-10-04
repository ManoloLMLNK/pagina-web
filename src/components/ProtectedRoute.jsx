import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute ({children, allowedRoles}) {

    const {currentUser} = useAuth();

    if (!currentUser) {

        return <Navigate to = "/" replace />;

    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {

        return <Navigate to = "/home" replace />;

    }

    return children

}