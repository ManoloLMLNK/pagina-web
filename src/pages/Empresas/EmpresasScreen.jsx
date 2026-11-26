import { useEffect, useState } from "react";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import ListToolbar from "../../components/organisms/ListToolbar/ListToolbar";
import DataTable from "../../components/organisms/DataTable/DataTable";
import EmpresaFormDialog from "../../components/organisms/EmpresaFormDialog/EmpresaFormDialog";
import ConfirmDialog from "../../components/ConfirmDialog/Confirmdialog";
import { useStoredList } from "../../hooks/useStoredList";
import { matchesSearch } from "../../utils/search";
import "../../styles/Admin.css";
import { useAuth } from "../../context/AuthContext";
import { sameRut } from "../../utils/rutMatch";

//las columnas de la tabla, para quitar agregar o reordenar se edita esta lista

const COLUMNS = [

    { key: "nombre", label: "Nombre" },

    { key: "rut", label: "Rut" },

    { key: "tipoBien", label: "Tipo de bien" },

    { key: "telefono", label: "Teléfono" },

    { key: "correo", label: "Correo" },

    { key: "comuna", label: "Comuna" },

    { key: "paginaWeb", label: "Página Web" },

];

const ROLE_LABELS = {

    administrador: "Administrador",
    vendedor: "Vendedor",
    comprador: "Comprador",

};

//la lista de empresas

export default function EmpresasScreen() {

    const { items: empresas, addItem, updateItem, removeItem } = useStoredList("compraya_empresas");

    const [search, setSearch] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);

    //la empresa q se esta editando

    const [editing, setEditing] = useState(null);

    const [toDelete, setToDelete] = useState(null);

    const { users } = useAuth();

    const columns = [

        ...COLUMNS,

        {

            key: "emprendedor",
            label: "Emprendedor",
            render: (row) => {

                const person = row.emprendedor;

                if (!person?.nombre) return "—";

                return person.cargo ? `${person.nombre} (${person.cargo})` : person.nombre;

            },

        },

        {

            key: "cuenta",
            label: "Cuenta vinculada",
            render: (row) => {

                if (!row.emprendedor?.rut) return "—";

                const account = users.find((u) => sameRut(u.rut, row.emprendedor.rut));

                return account ? `${account.fullName} (${ROLE_LABELS[account.role] ?? account.role})` : "Sin cuenta";

            },

        },

        {

            key: "empleados",
            label: "Empleados",
            render: (row) => {

                const staff = users.filter((u) => u.empresaId !== undefined && u.empresaId !== "" && String(u.empresaId) === String(row.id));

                if (staff.length === 0) return "—";

                return staff.map((u) => (u.cargo ? `${u.fullName} (${u.cargo})` : u.fullName)).join(", ");

            },

        },

    ];

    useEffect(() => {

        document.title = "CompraYa - Empresas";

    }, []);

    const visibleEmpresas = empresas.filter((e) => matchesSearch([e.nombre, e.paginaWeb], search));

    const handleAdd = () => {

        setEditing(null);

        setDialogOpen(true);

    };

    const handleEdit = (empresa) => {

        setEditing(empresa);

        setDialogOpen(true);

    };

    const handleCloseDialog = () => {

        setDialogOpen(false);

        setEditing(null);

    };

    const handleSave = (data) => {

        //el rut no se puede repetir

        if (empresas.some((e) => e.rut === data.rut && e.id !== editing?.id)) {

            return { ok: false, error: "Ya existe una empresa con ese RUT." };

        }

        if (editing) {

            updateItem(editing.id, data);

            console.log("Empresa actualizada:", editing.id);

        } else {

            const saved = addItem(data);

            console.log("Empresa guardada:", saved);

        }

        return { ok: true };

    };

    const handleDelete = (empresa) => setToDelete(empresa);

    const handleConfirmDelete = () => {

        if (toDelete) removeItem(toDelete.id);

        setToDelete(null);

    };

    return (

        <MainTemplate

            toolbar={

                <ListToolbar

                    title="Empresas"
                    searchPlaceholder="Buscar por Nombre o Página Web"
                    searchValue={search}
                    onSearchChange={setSearch}
                    onAdd={handleAdd}

                />

            }

        >

            <DataTable

                columns={columns}
                rows={visibleEmpresas}
                minRows={search ? 0 : 10}
                emptyMessage="No se encontraron empresas."
                onEdit={handleEdit}
                onDelete={handleDelete}

            />

            <EmpresaFormDialog

                open={dialogOpen}
                empresa={editing}
                onClose={handleCloseDialog}
                onSave={handleSave}

            />

            <ConfirmDialog

                open={Boolean(toDelete)}
                title="Eliminar empresa"
                message={toDelete ? `¿Seguro que quieres eliminar la empresa "${toDelete.nombre}"?` : ""}
                onConfirm={handleConfirmDelete}
                onClose={() => setToDelete(null)}

            />

        </MainTemplate>

    );

}