import { useEffect, useState } from "react";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import ListToolbar from "../../components/organisms/ListToolbar/ListToolbar";
import DataTable from "../../components/organisms/DataTable/DataTable";
import PublicationFormDialog from "../../components/organisms/PublicationFormDialog/PublicationFormDialog";
import ConfirmDialog from "../../components/ConfirmDialog/Confirmdialog";
import { useAuth } from "../../context/AuthContext";
import {

    TIPOS,
    addPublication,
    categoryLabel,
    getPublications,
    removePublication,
    updatePublication,

} from "../../data/catalog";
import { formatCLP } from "../../utils/currency";
import { matchesSearch } from "../../utils/search";
import "../../styles/Admin.css";

const STORAGE_ERROR = "No hay espacio para guardar. Prueba con menos fotos o con fotos más livianas.";

//cn menos de 10 unidades se avisa q queda poco

const LOW_STOCK = 9;

function StockBadge({ stock }) {

    if (typeof stock !== "number") return "—";

    const [label, color] =

        stock === 0

            ? ["Agotado", "#d32f2f"]

            : stock <= LOW_STOCK

                ? [`Quedan ${stock}`, "#ed6c02"]

                : [`${stock} disponibles`, "#2e7d32"];

    return (

        <span style={{ background: color, color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: "0.8rem" }}>

            {label}

        </span>

    );

}

//pantalla de gestion: el vendedor administra sus publicaciones
//y el administrador ve todas y puede eliminar las inapropiadas

export default function ManageItemsScreen({ tipo }) {

    const { currentUser } = useAuth();

    const [publications, setPublications] = useState(() => getPublications());

    const [search, setSearch] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editing, setEditing] = useState(null);

    const [toDelete, setToDelete] = useState(null);

    const [notice, setNotice] = useState("");

    const isAdmin = currentUser?.role === "administrador";

    const title = isAdmin ? `Administrar ${TIPOS[tipo].label}` : `Mis ${TIPOS[tipo].label}`;

    useEffect(() => {

        document.title = `CompraYa - ${title}`;

    }, [title]);

    const rows = publications

        .filter((p) => p.tipo === tipo && (isAdmin || p.sellerRut === currentUser?.rut))

        .filter((p) => matchesSearch([p.name, p.sellerName ?? ""], search));

    const columns = [

        {

            key: "images",
            label: "Foto",
            render: (row) =>

                row.images?.[0] ? (

                    <img

                        src={row.images[0]}
                        alt={row.name}
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}

                    />

                ) : (

                    "—"

                ),

        },

        { key: "name", label: "Nombre" },

        {

            key: "categoria",
            label: "Categoría",
            render: (row) => categoryLabel(row),

        },

        { key: "price", label: "Precio", render: (row) => formatCLP(row.price) },

        ...(tipo === "productos"

            ? [{ key: "stock", label: "Stock", render: (row) => row.variants?.length
                ? row.variants.map((v) => <div key={v.id}>{v.name}: <StockBadge stock={v.stock} /></div>)
                : <StockBadge stock={row.stock} /> }]

            : []),

        ...(isAdmin ? [{ key: "sellerName", label: "Publicado por" }] : []),

    ];

    const handleAdd = () => {

        setEditing(null);

        setDialogOpen(true);

    };

    const handleEdit = (row) => {

        setEditing(row);

        setDialogOpen(true);

    };

    const handleCloseDialog = () => {

        setDialogOpen(false);

        setEditing(null);

    };

    const handleSave = (data) => {

        const list = editing

            ? updatePublication(editing.id, data)

            : addPublication({ ...data, sellerRut: currentUser.rut, sellerName: currentUser.fullName });

        if (!list) return { ok: false, error: STORAGE_ERROR };

        setPublications(list);

        return { ok: true };

    };

    const handleConfirmDelete = () => {

        if (toDelete) {

            const list = removePublication(toDelete.id);

            if (list) setPublications(list);

            else setNotice("No se pudo eliminar. Intenta de nuevo.");

        }

        setToDelete(null);

    };

    return (

        <MainTemplate

            toolbar={

                <ListToolbar

                    title={title}
                    searchPlaceholder={`Buscar en ${TIPOS[tipo].label.toLowerCase()}`}
                    searchValue={search}
                    onSearchChange={setSearch}
                    onAdd={handleAdd}

                />

            }

        >

            {rows.length === 0 && !search && (

                <p className="item-grid__empty">

                    {isAdmin

                        ? `Todavía no hay ${TIPOS[tipo].label.toLowerCase()} publicados por vendedores.`

                        : `Aún no has publicado ${TIPOS[tipo].label.toLowerCase()}. Pulsa "+ Agregar" para crear el primero.`}

                </p>

            )}

            <DataTable

                columns={columns}
                rows={rows}
                minRows={search ? 0 : 10}
                emptyMessage="No se encontraron resultados."
                onEdit={handleEdit}
                onDelete={(row) => setToDelete(row)}
                canEdit={(row) => row.sellerRut === currentUser?.rut}
                canDelete={(row) => isAdmin || row.sellerRut === currentUser?.rut}

            />

            <PublicationFormDialog

                open={dialogOpen}
                tipo={tipo}
                publication={editing}
                onClose={handleCloseDialog}
                onSave={handleSave}

            />

            <ConfirmDialog

                open={Boolean(toDelete)}
                title={`Eliminar ${TIPOS[tipo].itemLabel.toLowerCase()}`}
                message={

                    toDelete

                        ? `¿Seguro que quieres eliminar "${toDelete.name}"?${toDelete.sellerRut !== currentUser?.rut ? ` Fue publicado por ${toDelete.sellerName}.` : ""}`

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