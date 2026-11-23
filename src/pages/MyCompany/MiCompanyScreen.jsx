import { useEffect } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import { useAuth } from "../../context/AuthContext";
import { getPublications } from "../../data/catalog";
import { useStoredList } from "../../hooks/useStoredList";
import { sameRut } from "../../utils/rutMatch";

const boxStyle = {

    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: "#fff",

};

//la empresa a la q pertenece la persona: se busca por su rut entre los emprendedores de las empresas
//(solo lectura, las empresas las administra el administrador)

export default function MyCompanyScreen() {

    const { currentUser } = useAuth();

    const { items: empresas } = useStoredList("compraya_empresas");

    useEffect(() => {

        document.title = "CompraYa - Mi Empresa";

    }, []);

    if (!currentUser) return null;

    const misEmpresas = empresas.filter((e) => sameRut(e.emprendedor?.rut, currentUser.rut));

    const mine = getPublications().filter((p) => p.sellerRut === currentUser.rut);

    const productos = mine.filter((p) => p.tipo === "productos").length;

    const servicios = mine.filter((p) => p.tipo === "servicios").length;

    return (

        <MainTemplate>

            <h2 className="section-title">Mi Empresa</h2>

            {misEmpresas.length === 0 && (

                <div style={boxStyle}>

                    <p>Todavía no estás asociado a ninguna empresa.</p>

                    <p>

                        Un administrador debe registrar tu empresa y escribir tu RUT ({currentUser.rut}) en la
                        información del emprendedor.

                    </p>

                </div>

            )}

            {misEmpresas.map((empresa) => (

                <div key={empresa.id} style={boxStyle}>

                    <h3 className="section-title">{empresa.nombre}</h3>

                    <p><strong>RUT:</strong> {empresa.rut}</p>
                    <p><strong>Correo:</strong> {empresa.correo || "—"}</p>
                    <p><strong>Teléfono:</strong> {empresa.telefono || "—"}</p>
                    <p><strong>Página web:</strong> {empresa.paginaWeb || "—"}</p>
                    <p><strong>Dirección local:</strong> {empresa.direccion || "—"}</p>

                    <p>

                        <strong>Ubicación:</strong>{" "}

                        {[empresa.comuna, empresa.region].filter(Boolean).join(", ") || "—"}

                    </p>

                    <h4>Tu información en la empresa</h4>

                    <p><strong>Cargo:</strong> {empresa.emprendedor?.cargo || "Sin cargo registrado"}</p>
                    <p><strong>Teléfono:</strong> {empresa.emprendedor?.telefono || "—"}</p>
                    <p><strong>Correo:</strong> {empresa.emprendedor?.correo || "—"}</p>
                    <p><strong>Dirección:</strong> {empresa.emprendedor?.direccion || "—"}</p>

                </div>

            ))}

            <div style={boxStyle}>

                <h3 className="section-title">Mis publicaciones</h3>

                <p>

                    <Link to="/administrar/productos">Productos publicados: {productos}</Link>

                </p>

                <p>

                    <Link to="/administrar/servicios">Servicios publicados: {servicios}</Link>

                </p>

            </div>

        </MainTemplate>

    );

}