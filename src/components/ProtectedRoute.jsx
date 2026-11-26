import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute ({children, allowedRoles}) {

    const {currentUser} = useAuth();

    const location = useLocation();

    if (!currentUser) {

        return <Navigate to = "/" replace />;

    }

    //las cuentas sin fecha de nacimiento deben completarla antes de seguir

    if (!currentUser.birthDate && location.pathname !== "/configuracion") {

        return <Navigate to = "/configuracion" replace state = {{missingBirthDate: true}} />;

    }

    const roles = currentUser.roles ?? [currentUser.role];

    if (allowedRoles && !allowedRoles.some((r) => roles.includes(r))) {

        return <Navigate to = "/home" replace />;

    }

    return children

}