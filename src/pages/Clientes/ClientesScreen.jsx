import { useEffect, useState } from "react";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import ListToolbar from "../../components/organisms/ListToolbar/ListToolbar";
import DataTable from "../../components/organisms/DataTable/DataTable";
import ClienteFormDialog from "../../components/organisms/ClienteFormDialog/ClienteFormDialog";
import UserEditDialog from "../../components/organisms/UserEditDialog/UserEditDialog";
import ConfirmDialog from "../../components/ConfirmDialog/Confirmdialog";
import { useStoredList } from "../../hooks/useStoredList";
import { matchesSearch } from "../../utils/search";
import "../../styles/Admin.css";
import { findContactConflict, useAuth } from "../../context/AuthContext";

//las columnas de la tabla para quitar agregar o reordenar se edita esta lista

const COLUMNS = [

    { key: "nombre", label: "Nombre" },
    { key: "rut", label: "Rut" },
    { key: "telefono", label: "Teléfono" },
    { key: "correo", label: "Correo" },
    { key: "direccion", label: "Dirección" },

];

const ROLES = [

    { value: "administrador", label: "Administrador" },
    { value: "vendedor", label: "Vendedor" },
    { value: "comprador", label: "Comprador" },

];

//junta los datos de la fila con los de la cuenta para llenar el formulario de edicion
//asi no se pierden los telefonos y direcciones extra de una cuenta

function buildEditValues(row, users) {

    const account = users.find((u) => u.rut === row.rut);

    return {

        id: row.id,
        esCuenta: Boolean(row.esCuenta),
        rut: row.rut,
        nombre: account?.fullName ?? row.nombre ?? "",
        correo: account?.email ?? row.correo ?? "",
        phones: account?.phones ?? (account?.phone ? [account.phone] : row.telefono ? [row.telefono] : []),
        addresses: account?.addresses ?? (row.direccion ? [row.direccion] : []),

    };

}

//la lista de clientes

export default function ClientesScreen() {

    const { items: clientes, addItem, updateItem, removeItem } = useStoredList("compraya_clientes");

    const { items: empresas } = useStoredList("compraya_empresas");

    const [search, setSearch] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);

    const [toDelete, setToDelete] = useState(null);

    const [notice, setNotice] = useState("");

    const [editing, setEditing] = useState(null);

    useEffect(() => {

        document.title = "CompraYa - Clientes";

    }, []);

    const { users, currentUser, changeUserRoles, removeUser, updateProfile } = useAuth();

    //las cuentas registradas q no estan en la lista de clientes tambien se muestran

    const accountRows = users

        .filter((u) => !clientes.some((c) => c.rut === u.rut))

        .map((u) => ({

            id: `cuenta-${u.rut}`,
            nombre: u.fullName,
            rut: u.rut,
            telefono: u.phones?.[0] ?? u.phone,
            correo: u.email,
            direccion: u.addresses?.[0],
            esCuenta: true,

        }));

    const visibleClientes = [...clientes, ...accountRows].filter((c) => matchesSearch([c.nombre, c.rut], search));

    //todos los correos y telefonos ya usados las cuentas y los clientes de la lista

    const knownContacts = [

        ...users,
        ...clientes.map((c) => ({ rut: c.rut, email: c.correo, phones: c.telefono ? [c.telefono] : [] })),

    ];

    //la columna Rol un selector si la persona tiene cuenta

    const columns = [

        ...COLUMNS,

        {

            key: "rol",
            label: "Rol",
            render: (row) => {

                const account = users.find((u) => u.rut === row.rut);

                if (!account) return "Sin cuenta";

                const roles = account.roles ?? [account.role];

                const isSelf = account.rut === currentUser?.rut;

                return (

                    <span>

                        {ROLES.map((r) => (

                            <label key={r.value} style={{ display: "inline-block", marginRight: 8, whiteSpace: "nowrap" }}>

                                <input

                                    type="checkbox"
                                    checked={roles.includes(r.value)}
                                    disabled={isSelf}
                                    onChange={(e) => {

                                        const next = e.target.checked ? [...roles, r.value] : roles.filter((x) => x !== r.value);

                                        const result = changeUserRoles(account.rut, next);

                                        if (!result.ok) setNotice(result.error);

                                    }}

                                />{" "}

                                {r.label}

                            </label>

                        ))}

                    </span>

                );

            },

        },

    ];

    const handleSave = (data) => {

        if (clientes.some((c) => c.rut === data.rut)) {

            return { ok: false, error: "Ya existe un cliente con ese RUT." };

        }

        //correo y telefono son unicos por persona

        const conflict = findContactConflict(knownContacts, {

            rut: data.rut,
            email: data.correo,
            phones: data.telefono ? [data.telefono] : [],

        });

        if (conflict) {

            return { ok: false, field: conflict.field === "phones" ? "telefono" : "correo", error: conflict.error };

        }

        const saved = addItem(data);

        console.log("Cliente guardado:", saved);

        return { ok: true };

    };

    const handleEdit = (row) => setEditing(buildEditValues(row, users));

    const handleSaveEdit = (data) => {

        //antes de guardar nada el correo y los telefonos no pueden ser de otra persona

        const conflict = findContactConflict(knownContacts, {

            rut: editing.rut,
            email: data.correo,
            phones: data.phones,

        });

        if (conflict) {

            setNotice(conflict.error);

            return;

        }

        //si la persona tiene cuenta se actualiza la cuenta

        const account = users.find((u) => u.rut === editing.rut);

        if (account) {

            const result = updateProfile(editing.rut, {

                fullName: data.nombre,
                email: data.correo,
                phones: data.phones,
                addresses: data.addresses,
                empresaId: data.empresaId,
                cargo: data.cargo,

            });

            if (!result.ok) {

                setNotice(result.error);

                return;

            }

            //quien queda asignado a una empresa tambien recibe el rol de vendedor

            const roles = account.roles ?? [account.role];

            if (data.empresaId && !roles.includes("vendedor")) {

                changeUserRoles(editing.rut, [...roles, "vendedor"]);

            }

        }

        //y si ademas esta en la lista de clientes tambien se actualiza ahi

        if (!editing.esCuenta) {

            updateItem(editing.id, {

                nombre: data.nombre,
                correo: data.correo,
                telefono: data.phones[0] ?? "",
                direccion: data.addresses[0] ?? "",

            });

        }

        setEditing(null);

    };

    const handleDelete = (cliente) => setToDelete(cliente);

    const handleConfirmDelete = () => {

        if (!toDelete) return;

        //si la persona tiene cuenta, tambien se elimina la cuenta

        const hasAccount = users.some((u) => u.rut === toDelete.rut);

        if (hasAccount) {

            const result = removeUser(toDelete.rut);

            if (!result.ok) {

                setToDelete(null);

                setNotice(result.error);

                return;

            }

        }

        if (!toDelete.esCuenta) removeItem(toDelete.id);

        setToDelete(null);

    };

    return (

        <MainTemplate

            toolbar={

                <ListToolbar

                    title="Clientes"
                    searchPlaceholder="Buscar por Nombre o Rut"
                    searchValue={search}
                    onSearchChange={setSearch}
                    onAdd={() => setDialogOpen(true)}

                />

            }

        >

            <DataTable

                columns={columns}
                rows={visibleClientes}
                minRows={search ? 0 : 10}
                emptyMessage="No se encontraron clientes."
                onEdit={handleEdit}
                onDelete={handleDelete}

            />

            <ClienteFormDialog

                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}

            />

            <UserEditDialog

                open={Boolean(editing)}
                user={editing}
                empresas={empresas}
                onClose={() => setEditing(null)}
                onSave={handleSaveEdit}

            />

            <ConfirmDialog

                open={Boolean(toDelete)}
                title="Eliminar cliente"
                message={

                    toDelete

                        ? `¿Seguro que quieres eliminar a "${toDelete.nombre}"?${users.some((u) => u.rut === toDelete.rut) ? " También se eliminará su cuenta." : ""}`

                        : ""

                }
                onConfirm={handleConfirmDelete}
                onClose={() => setToDelete(null)}

            />

            <ConfirmDialog

                open={Boolean(notice)}
                title="No se pudo completar"
                message={notice}
                confirmLabel="Entendido"
                onConfirm={() => setNotice("")}
                onClose={() => setNotice("")}

            />

        </MainTemplate>

    );

}