import { createContext, useContext, useEffect, useState } from "react";
import { hashPassword, checkPassword } from "../utils/password";
import { isAdult } from "../utils/age";

const AuthContext = createContext(null);

const USERS_KEY = "compraya_users";

const SESSION_KEY = "compraya_session";

const ROLE_PRIORITY = ["administrador", "vendedor", "comprador"];

//esto es lo q se eliminara a futuro cuando ya tengamos el backend
//osea la base de datos, esto por ahora hara una simulacion

const SEED_ADMIN = {

    rut: "11.111.111-1",
    passwordHash: hashPassword("admin1234"),
    fullName: "Administrador Principal",
    email: "admin@compraya.cl",
    phone: "+56911111111",
    birthDate: "01/01/1980",
    roles: ["administrador"],
    role: "administrador"

};

function withRoles(user) {

    const list = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role];

    const roles = ROLE_PRIORITY.filter((r) => list.includes(r));

    const finalRoles = roles.length > 0 ? roles : ["comprador"];

    return { ...user, roles: finalRoles, role: finalRoles[0] };

}

const phoneKey = (v) => {

    const d = String(v ?? "").replace(/\D/g, "");

    return d.length > 9 && d.startsWith("56") ? d.slice(2) : d;

};

const emailKey = (v) => String(v ?? "").trim().toLowerCase();

//las cuentas antiguas guardaban un solo telefono

const userPhones = (u) => u.phones ?? (u.phone ? [u.phone] : []);

//busca si el correo o algun telefono ya lo usa otra cuenta

export function findContactConflict(users, { rut, email, phones = [] }) {

    const others = users.filter((u) => u.rut !== rut);

    if (email && others.some((u) => emailKey(u.email) === emailKey(email))) {

        return { field: "email", error: "Este correo ya está registrado en otra cuenta." };

    }

    for (const phone of phones) {

        if (!phoneKey(phone)) continue;

        if (others.some((u) => userPhones(u).some((p) => phoneKey(p) === phoneKey(phone)))) {

            return { field: "phones", value: phone, error: "Este teléfono ya está registrado en otra cuenta." };

        }

    }

    return null;

}

function loadUsers() {

    try {

        const raw = localStorage.getItem(USERS_KEY);

        const stored = raw ? JSON.parse(raw) : [];

        //las cuentas antiguas tenian la contraseña en texto plano

        const users = stored

            .map(({ password, ...u }) =>

                password && !u.passwordHash ? { ...u, passwordHash: hashPassword(password) } : u

            )

            //la cuenta del administrador de prueba siempre tiene fecha de nacimiento

            .map((u) => (u.rut === SEED_ADMIN.rut && !u.birthDate ? { ...u, birthDate: SEED_ADMIN.birthDate } : u))

            .map(withRoles);

        if (!users.some((u) => u.rut === SEED_ADMIN.rut)) {

            users.push(withRoles(SEED_ADMIN));

        }

        return users;

    }   catch {

        return [withRoles(SEED_ADMIN)];

    }

}

function loadSession() {

    try {

        const raw = localStorage.getItem(SESSION_KEY);

        if (!raw) return null;

        const { password, passwordHash, ...safeUser } = JSON.parse(raw);

        return withRoles(safeUser);

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

    const register = ({rut, fullName, email, phones, addresses, password, birthDate}) => {

        if (users.some((u) => u.rut === rut)) {

            return {ok: false, field: "rut", error: "Ya existe una cuenta con ese RUT"};

        }

        if (!isAdult(birthDate)) {

            return {ok: false, field: "birthDate", error: "Debes ser mayor de 18 años para registrarte"};

        }

        const conflict = findContactConflict(users, {rut, email, phones});

        if (conflict) return {ok: false, ...conflict};

        const newUser = {

            rut,
            fullName,
            email,
            phones,
            addresses,
            birthDate,
            phone: phones?.[0],
            passwordHash: hashPassword(password),
            roles: ["comprador"],
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

        //solo mayores de 18 las cuentas antiguas sin fecha entran pero deben completarla

        if (found.birthDate && !isAdult(found.birthDate)) {

            return {ok: false, error: "Debes ser mayor de 18 años para ingresar"};

        }

        const { passwordHash, ...safeUser } = found;

        setCurrentUser(safeUser);

        return {ok: true, user: safeUser};

    };

    const logout = () => setCurrentUser(null);

    //asigna la lista completa de roles de una cuenta

    const changeUserRoles = (rut, roles) => {

        const clean = ROLE_PRIORITY.filter((r) => roles.includes(r));

        if (clean.length === 0) {

            return {ok: false, error: "La cuenta debe tener al menos un rol."};

        }

        const target = users.find((u) => u.rut === rut);

        const admins = users.filter((u) => u.roles?.includes("administrador"));

        if (target?.roles?.includes("administrador") && !clean.includes("administrador") && admins.length <= 1) {

            return {ok: false, error: "No se puede quitar el rol al único administrador."};

        }

        const apply = (u) => ({...u, roles: clean, role: clean[0]});

        setUsers((prev) => prev.map((u) => (u.rut === rut ? apply(u) : u)));

        setCurrentUser((prev) => (prev?.rut === rut ? apply(prev) : prev));

        return {ok: true};

    };

    //se mantiene para no romper pantallas antiguas deja a la cuenta cn un solo rol

    const changeUserRole = (rut, role) => changeUserRoles(rut, [role]);

    const removeUser = (rut) => {

        if (rut === currentUser?.rut) {

            return {ok: false, error: "No puedes eliminar tu propia cuenta."};

        }

        //la cuenta principal se vuelve a crear sola al cargar la pagina asi q no se elimina

        if (rut === SEED_ADMIN.rut) {

            return {ok: false, error: "La cuenta del administrador principal no se puede eliminar."};

        }

        const target = users.find((u) => u.rut === rut);

        if (target?.roles?.includes("administrador") && users.filter((u) => u.roles?.includes("administrador")).length <= 1) {

            return {ok: false, error: "No se puede eliminar al único administrador."};

        }

        setUsers((prev) => prev.filter((u) => u.rut !== rut));

        return {ok: true};

    };

    //actualiza solo los datos q lleguen

    const updateProfile = (rut, data) => {

        const conflict = findContactConflict(users, {

            rut,
            email: data.email,
            phones: data.phones ?? (data.phone ? [data.phone] : []),

        });

        if (conflict) return {ok: false, ...conflict};

        const changes = { ...data };

        if (data.phones) changes.phone = data.phones[0];

        setUsers((prev) => prev.map((u) => (u.rut === rut ? { ...u, ...changes } : u)));

        setCurrentUser((prev) => (prev?.rut === rut ? { ...prev, ...changes } : prev));

        return { ok: true };

    };

    const addAdmin = ({rut, fullName, email, phone, password, birthDate}) => {

        if (users.some((u) => u.rut === rut)) {

            return {ok: false, field: "rut", error: "Ya existe una cuenta con ese RUT"};

        }

        const conflict = findContactConflict(users, {rut, email, phones: [phone]});

        if (conflict) return {ok: false, ...conflict};

        const newAdmin = {

            rut,
            fullName,
            email,
            phone,
            birthDate,
            passwordHash: hashPassword(password),
            roles: ["administrador"],
            role: "administrador",

        };

        setUsers((prev) => [...prev, newAdmin]);

        const { passwordHash, ...safeAdmin } = newAdmin;

        return {ok: true, user: safeAdmin};

    };

    return (

        <AuthContext.Provider

            value={{users, currentUser, register, login, logout, changeUserRole, changeUserRoles, addAdmin, updateProfile, removeUser}}

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