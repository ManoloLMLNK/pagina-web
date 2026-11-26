import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import EmpresaFormDialog from "../../components/organisms/EmpresaFormDialog/EmpresaFormDialog";
import { useAuth } from "../../context/AuthContext";
import { getPublications } from "../../data/catalog";
import { useStoredList } from "../../hooks/useStoredList";
import { sameRut } from "../../utils/rutMatch";
import "../../styles/Admin.css";

const boxStyle = {

    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: "#fff",

};

const editButtonStyle = {

    height: 34,
    padding: "0 16px",
    border: "none",
    borderRadius: 6,
    background: "#5f4b8b",
    color: "#ffffff",
    font: "inherit",
    fontSize: "0.85rem",
    cursor: "pointer",

};

//las empresas de la persona donde su rut es el del emprendedor
//o donde un administrador la asigno cm empleada

export default function MyCompanyScreen() {

    const { currentUser } = useAuth();

    const { items: empresas, updateItem } = useStoredList("compraya_empresas");

    //la empresa q se esta editando

    const [editing, setEditing] = useState(null);

    const [saved, setSaved] = useState(false);

    useEffect(() => {

        document.title = "CompraYa - Mi Empresa";

    }, []);

    if (!currentUser) return null;

    const isOwner = (empresa) => sameRut(empresa.emprendedor?.rut, currentUser.rut);

    const isAssigned = (empresa) =>

        currentUser.empresaId !== undefined &&
        currentUser.empresaId !== "" &&
        String(empresa.id) === String(currentUser.empresaId);

    const misEmpresas = empresas.filter((e) => isOwner(e) || isAssigned(e));

    const mine = getPublications().filter((p) => p.sellerRut === currentUser.rut);

    const productos = mine.filter((p) => p.tipo === "productos").length;

    const servicios = mine.filter((p) => p.tipo === "servicios").length;

    const handleEdit = (empresa) => {

        setSaved(false);

        setEditing(empresa);

    };

    //el emprendedor edita los datos de su empresa pero no puede dejar de ser el emprendedor

    const handleSave = (data) => {

        if (!editing || !isOwner(editing)) {

            return { ok: false, error: "Solo el emprendedor de la empresa puede editarla." };

        }

        if (empresas.some((e) => e.rut === data.rut && e.id !== editing.id)) {

            return { ok: false, error: "Ya existe una empresa con ese RUT." };

        }

        if (!sameRut(data.emprendedor.rut, currentUser.rut)) {

            return {

                ok: false,
                field: "emprendedorRut",
                error: "El RUT del emprendedor debe ser el tuyo. Si necesitas cambiarlo, pídeselo a un administrador.",

            };

        }

        updateItem(editing.id, data);

        setSaved(true);

        return { ok: true };

    };

    return (

        <MainTemplate>

            <h2 className="section-title">Mi Empresa</h2>

            {saved && <p role="status">Los datos de tu empresa se actualizaron correctamente.</p>}

            {misEmpresas.length === 0 && (

                <div style={boxStyle}>

                    <p>Todavía no estás asociado a ninguna empresa.</p>

                    <p>

                        Un administrador puede asignarte una empresa desde Clientes (Editar), o registrar tu RUT (
                        {currentUser.rut}) en la información del emprendedor de la empresa.

                    </p>

                </div>

            )}

            {misEmpresas.map((empresa) => {

                const owner = isOwner(empresa);

                return (

                    <div key={empresa.id} style={boxStyle}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

                            <h3 className="section-title" style={{ margin: 0 }}>{empresa.nombre}</h3>

                            {owner && (

                                <button type="button" style={editButtonStyle} onClick={() => handleEdit(empresa)}>

                                    Editar empresa

                                </button>

                            )}

                        </div>

                        <p><strong>RUT:</strong> {empresa.rut}</p>
                        <p><strong>Ofrece:</strong> {empresa.tipoBien || "—"}</p>
                        <p><strong>Correo:</strong> {empresa.correo || "—"}</p>
                        <p><strong>Teléfono:</strong> {empresa.telefono || "—"}</p>
                        <p><strong>Página web:</strong> {empresa.paginaWeb || "—"}</p>
                        <p><strong>Dirección local:</strong> {empresa.direccion || "—"}</p>

                        <p>

                            <strong>Ubicación:</strong>{" "}

                            {[empresa.comuna, empresa.region].filter(Boolean).join(", ") || "—"}

                        </p>

                        <h4>Tu información en la empresa</h4>

                        <p>

                            <strong>Cargo:</strong>{" "}

                            {(owner ? empresa.emprendedor?.cargo : currentUser.cargo) || "Sin cargo registrado"}

                        </p>

                        {owner && (

                            <>

                                <p><strong>Teléfono:</strong> {empresa.emprendedor?.telefono || "—"}</p>
                                <p><strong>Correo:</strong> {empresa.emprendedor?.correo || "—"}</p>
                                <p><strong>Dirección:</strong> {empresa.emprendedor?.direccion || "—"}</p>

                            </>

                        )}

                        {!owner && <p><small>Solo el emprendedor de la empresa puede editar estos datos.</small></p>}

                    </div>

                );

            })}

            <div style={boxStyle}>

                <h3 className="section-title">Mis publicaciones</h3>

                <p>

                    <Link to="/administrar/productos">Productos publicados: {productos}</Link>

                </p>

                <p>

                    <Link to="/administrar/servicios">Servicios publicados: {servicios}</Link>

                </p>

            </div>

            <EmpresaFormDialog

                open={Boolean(editing)}
                empresa={editing}
                onClose={() => setEditing(null)}
                onSave={handleSave}

            />

        </MainTemplate>

    );

}