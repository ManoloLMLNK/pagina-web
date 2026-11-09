import { useEffect, useState } from "react";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import ListToolbar from "../../components/organisms/ListToolbar/ListToolbar";
import DataTable from "../../components/organisms/DataTable/DataTable";
import ClienteFormDialog from "../../components/organisms/ClienteFormDialog/ClienteFormDialog";
import { useStoredList } from "../../hooks/useStoredList";
import { matchesSearch } from "../../utils/search";
import "../../styles/Admin.css";
import { useAuth } from "../../context/AuthContext";

//las columnas de la tabla para quitar, agregar o reordenar, se edita esta lista

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

//la lista de clientes (solo para administradores)

export default function ClientesScreen() {

    const { items: clientes, addItem, removeItem } = useStoredList("compraya_clientes");

    const [search, setSearch] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {

        document.title = "CompraYa - Clientes";

    }, []);

    const { users, currentUser, changeUserRole } = useAuth();

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

    //la columna Rol un selector si la persona tiene cuenta

    const columns = [

        ...COLUMNS,

        {

            key: "rol",
            label: "Rol",
            render: (row) => {

                const account = users.find((u) => u.rut === row.rut);

                if (!account) return "Sin cuenta";

                return (

                    <select

                        value={account.role}
                        disabled={account.rut === currentUser?.rut}
                        onChange={(e) => changeUserRole(account.rut, e.target.value)}

                    >

                        {ROLES.map((r) => (

                            <option key={r.value} value={r.value}>{r.label}</option>

                        ))}

                    </select>

                );

            },

        },

    ];

    const handleSave = (data) => {

        if (clientes.some((c) => c.rut === data.rut)) {

            return { ok: false, error: "Ya existe un cliente con ese RUT." };

        }

        const saved = addItem(data);

        console.log("Cliente guardado:", saved);

        return { ok: true };

    };

    const handleDelete = (cliente) => {

        if (cliente.esCuenta) {

            window.alert("Esta fila es una cuenta registrada y no se puede eliminar desde aquí.");

            return;

        }

        if (window.confirm(`¿Eliminar al cliente "${cliente.nombre}"?`)) {

            removeItem(cliente.id);

        }

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
                onDelete={handleDelete}

            />

            <ClienteFormDialog

                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}

            />

        </MainTemplate>

    );

}