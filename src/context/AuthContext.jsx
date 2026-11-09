import { createContext, useContext, useEffect, useState } from "react";
import { hashPassword, checkPassword } from "../utils/password";

const AuthContext = createContext(null);

const USERS_KEY = "compraya_users";

const SESSION_KEY = "compraya_session";

//esto es lo q se eliminara a futuro cuando ya tengamos el backend
//osea la base de datos, esto por ahora hara una simulacion

const SEED_ADMIN = {

    rut: "11.111.111-1",
    passwordHash: hashPassword("admin1234"),
    fullName: "Administrador Principal",
    email: "admin@compraya.cl",
    phone: "+56911111111",
    role: "administrador"

};

function loadUsers() {

    try {

        const raw = localStorage.getItem(USERS_KEY);

        const stored = raw ? JSON.parse(raw) : [];

        //las cuentas antiguas tenian la contraseña en texto plano
        //se convierten a hash

        const users = stored.map(({ password, ...u }) =>

            password && !u.passwordHash ? { ...u, passwordHash: hashPassword(password) } : u

        );

        if (!users.some((u) => u.rut === SEED_ADMIN.rut)) {

            users.push(SEED_ADMIN);

        }

        return users;

    }   catch {

        return [SEED_ADMIN];

    }

}

function loadSession() {

    try {

        const raw = localStorage.getItem(SESSION_KEY);

        if (!raw) return null;

        const { password, passwordHash, ...safeUser } = JSON.parse(raw);

        return safeUser;

    }   catch {

        return null;

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

    const register = ({rut, fullName, email, phones, addresses, password}) => {

        if (users.some((u) => u.rut === rut)) {

            return {ok: false, error: "Ya existe una cuenta con ese RUT"};

        }

        const newUser = {

            rut,
            fullName,
            email,
            phones,
            addresses,
            phone: phones?.[0],
            passwordHash: hashPassword(password),
            role: "comprador",

        };

        setUsers((prev) => [...prev, newUser]);

        const { passwordHash, ...safeUser } = newUser;

        return {ok: true, user: safeUser};

    };

    const login = (rut, password) => {

        const found = users.find((u) => u.rut === rut);

        if (!found || !checkPassword(password, found.passwordHash)) {

            return {ok: false, error: "RUT o contraseña incorrectos"};

        }

        const { passwordHash, ...safeUser } = found;

        setCurrentUser(safeUser);

        return {ok: true, user: safeUser};

    };

    const logout = () => setCurrentUser(null);

    //selector/subir rango o degradar rangos a los usuarios

    const changeUserRole = (rut, role) => {

        setUsers((prev) => prev.map((u) => (u.rut === rut ? {...u, role} : u)));

        setCurrentUser((prev) => (prev?.rut === rut ? {...prev, role} : prev));

    }

    const updateProfile = (rut, { fullName, email, phones, addresses }) => {

        const changes = { fullName, email, phones, addresses, phone: phones?.[0] };

        setUsers((prev) => prev.map((u) => (u.rut === rut ? { ...u, ...changes } : u)));

        setCurrentUser((prev) => (prev?.rut === rut ? { ...prev, ...changes } : prev));

        return { ok: true };

    };

    const addAdmin = ({rut, fullName, email, phone, password}) => {

        if (users.some((u) => u.rut === rut)) {

            return {ok: false, error: "Ya existe una cuenta con ese RUT"};

        }

        const newAdmin = {rut, fullName, email, phone, passwordHash: hashPassword(password), role: "administrador"};

        setUsers((prev) => [...prev, newAdmin]);

        const { passwordHash, ...safeAdmin } = newAdmin;

        return {ok: true, user: safeAdmin};

    };

    return (

        <AuthContext.Provider
                
            value={{users, currentUser, register, login, logout, changeUserRole, addAdmin, updateProfile}}

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