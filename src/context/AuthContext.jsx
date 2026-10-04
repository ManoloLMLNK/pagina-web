import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "compraya_users";

const SESSION_KEY = "compraya_session";

//esto es lo q se eliminara a futuro cuando ya tengamos el backend
//osea la base de datos, esto por ahora hara una simulacion

const SEED_ADMIN = {

    rut: "11.111.111-1",
    password: "admin1234",
    fullName: "Administrador Principal",
    email: "admin@compraya.cl",
    phone: "+56911111111",
    role: "administrador"

};

function loadUsers() {

    try {

        const raw = localStorage.getItem(USERS_KEY);

        const users = raw ? JSON.parse(raw) : [];

        if (!users.some((u) => u.rut === SEED_ADMIN.rut)) {

            users.push(SEED_ADMIN)

        }

        return users;

    }   catch {

        return [SEED_ADMIN]

    }

}

function loadSession() {

    try {

        const raw = localStorage.getItem(SESSION_KEY);

        return raw ? JSON.parse(raw) : null;

    }   catch {

        return null

    }

}

export function AuthProvider({children}) {

    const [users, setUsers] = useState(loadUsers);

    const [currentUser, setCurrentUser] = useState(loadSession);

    useEffect(() => {

        localStorage.setItem(USERS_KEY, JSON.stringify(users));

    }, [users]);

    useEffect(() => {

        if (currentUser) {

            localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));

        } else {

            localStorage.removeItem(SESSION_KEY)

        }

    }, [currentUser]);

    const register = ({rut, fullName, email, phone, password}) => {

        if (users.some((u) => u.rut === rut)) {

            return {ok: false, error: "Ya existe una cuenta con ese RUT"};

        }

        const newUser = {rut, fullName, email, phone, password, role: "comprador"};

        setUsers((prev) => [...prev, newUser]);

        return {ok: true, user: newUser};

    };

    const login = (rut, password) => {

        const found = users.find((u) => u.rut === rut && u.password === password);

        if (!found) {

            return {ok: false, error: "RUT o contraseña incorrectos"};

        }

        setCurrentUser(found);

        return {ok: true, user: found};

    };

    const logout = () => setCurrentUser(null);

    //selector/subir rango o degradar rangos a los usuarios

    const changeUserRole = (rut, role) => {

        setUsers((prev) => prev.map((u) => (u.rut === rut ? {...u, role} : u)));

        setCurrentUser((prev) => (prev?.rut === rut ? {...prev, role} : prev));

    }

    const addAdmin = ({rut, fullName, email, phone, password}) => {

        if (users.some((u) => u.rut === rut)) {

            return {ok: false, error: "Ya existe una cuenta con ese RUT"};

        }

        const newAdmin = {rut, fullName, email, phone, password, role: "administrador"};

        setUsers((prev) => [...prev, newAdmin]);

        return {ok: true, user: newAdmin};

    };

    return (

        <AuthContext.Provider
                
            value={{users, currentUser, register, login, logout, changeUserRole, addAdmin}}

            >

                {children}

            </AuthContext.Provider>

    );

}


export function useAuth() {

    const ctx = useContext(AuthContext);

    if (!ctx) throw new Error("useAuth debe usarse dentro de <Authprovider>");

    return ctx

}