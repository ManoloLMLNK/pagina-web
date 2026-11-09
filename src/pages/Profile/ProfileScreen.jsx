import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import { useAuth } from "../../context/AuthContext";
import { getItemById } from "../../data/catalog";
import { formatCLP } from "../../utils/currency";
import { getOrders } from "../../utils/orders";
import { getWishlist, removeFromWishlist } from "../../utils/wishlist";

const ROLE_LABELS = {

    administrador: "Administrador",
    vendedor: "Vendedor",
    comprador: "Comprador",

};

const boxStyle = {

    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: "#fff",

};

//aqui solo se muestran los datos de la cuenta cn la sesion abierta
//no hay ninguna ruta para ver los datos de otro usuario

export default function ProfileScreen() {

    const { currentUser } = useAuth();

    const [orders] = useState(() => getOrders(currentUser?.rut));

    const [wishlist, setWishlist] = useState(() => getWishlist(currentUser?.rut));

    useEffect(() => {

        document.title = "CompraYa - Mi Perfil";

    }, []);

    if (!currentUser) return null;

    //las cuentas antiguas guardaban un solo telefono

    const phones = currentUser.phones ?? (currentUser.phone ? [currentUser.phone] : []);

    const addresses = currentUser.addresses ?? [];

    const wishItems = wishlist.map((id) => getItemById(id)).filter(Boolean);

    const handleRemoveWish = (id) => setWishlist(removeFromWishlist(currentUser.rut, id));

    return (

        <MainTemplate>

            <h2 className="section-title">Mi Perfil</h2>

            <div style={boxStyle}>

                <h3 className="section-title">Datos personales</h3>

                <p><strong>Nombre:</strong> {currentUser.fullName}</p>
                <p><strong>RUT:</strong> {currentUser.rut}</p>
                <p><strong>Correo:</strong> {currentUser.email}</p>
                <p><strong>Rol:</strong> {ROLE_LABELS[currentUser.role] ?? currentUser.role}</p>

                <p><strong>Teléfonos:</strong></p>

                {phones.length > 0 ? (

                    <ul>{phones.map((p) => <li key={p}>{p}</li>)}</ul>

                ) : (

                    <p>—</p>

                )}

                <p><strong>Direcciones:</strong></p>

                {addresses.length > 0 ? (

                    <ul>{addresses.map((a) => <li key={a}>{a}</li>)}</ul>

                ) : (

                    <p>—</p>

                )}

                <Link to="/configuracion">Editar mis datos</Link>

            </div>

            <div style={boxStyle}>

                <h3 className="section-title">Mis deseados ({wishItems.length})</h3>

                {wishItems.length === 0 && <p>Aún no tienes productos en tu lista de deseados.</p>}

                {wishItems.map((item) => (

                    <p key={item.id}>

                        <Link to={`/item/${item.id}`}>{item.name}</Link> — {formatCLP(item.price)}{" "}

                        <button type="button" onClick={() => handleRemoveWish(item.id)}>Quitar</button>

                    </p>

                ))}

            </div>

            <div style={boxStyle}>

                <h3 className="section-title">Mis compras ({orders.length})</h3>

                {orders.length === 0 && <p>Aún no has realizado compras.</p>}

                {orders.map((order) => (

                    <div key={order.id} style={{borderTop: "1px solid #eee", paddingTop: 8, marginTop: 8}}>

                        <p><strong>Pedido #{order.id}</strong> — {order.date}</p>
                        <p><strong>Estado:</strong> {order.estado}</p>

                        <ul>

                            {order.items.map((it) => (

                                <li key={it.id}>{it.name} x {it.quantity}</li>

                            ))}

                        </ul>

                        <p><strong>Total:</strong> {formatCLP(order.total)}</p>

                    </div>

                ))}

            </div>

        </MainTemplate>

    );

}