import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import { useAuth } from "../../context/AuthContext";
import { getItemById } from "../../data/catalog";
import { getAge } from "../../utils/age";
import { formatCLP } from "../../utils/currency";
import { CANCELLED, TRANSACTION_STATES, getOrders, orderSellerRut, transactionStatus } from "../../utils/orders";
import OrderActions from "../../components/molecules/OrderActions/OrderActions";
import { generateHistoryPDF } from "../../utils/pdf";
import { getWishlist, removeFromWishlist } from "../../utils/wishlist";
import OrderStatusTracker from "../../components/molecules/OrderStatusTracker/OrderStatusTracker";
import { paymentSummary } from "../../utils/payment";
import { addressLabel } from "../../utils/shipping";

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

    const [orders, setOrders] = useState(() => getOrders(currentUser?.rut));

    const [filter, setFilter] = useState("Todas");

    const [wishlist, setWishlist] = useState(() => getWishlist(currentUser?.rut));

    useEffect(() => {

        document.title = "CompraYa - Mi Perfil";

    }, []);

    if (!currentUser) return null;

    //las cuentas antiguas guardaban un solo telefono

    const phones = currentUser.phones ?? (currentUser.phone ? [currentUser.phone] : []);

    const addresses = currentUser.addresses ?? [];

    const roles = (currentUser.roles ?? [currentUser.role]).map((r) => ROLE_LABELS[r] ?? r);

    const wishItems = wishlist.map((id) => getItemById(id)).filter(Boolean);

    const shownOrders = orders.filter((o) => filter === "Todas" || transactionStatus(o) === filter);

    const handleRemoveWish = (id) => setWishlist(removeFromWishlist(currentUser.rut, id));

    return (

        <MainTemplate>

            <h2 className="section-title">Mi Perfil</h2>

            <div style={boxStyle}>

                <h3 className="section-title">Datos personales</h3>

                <p><strong>Nombre:</strong> {currentUser.fullName}</p>
                <p><strong>RUT:</strong> {currentUser.rut}</p>
                <p><strong>Correo:</strong> {currentUser.email}</p>

                <p>

                    <strong>Edad:</strong>{" "}

                    {currentUser.birthDate

                        ? `${getAge(currentUser.birthDate)} años (${currentUser.birthDate})`

                        : "—"}

                </p>

                <p><strong>{roles.length > 1 ? "Roles" : "Rol"}:</strong> {roles.join(" y ")}</p>

                <p><strong>Teléfonos:</strong></p>

                {phones.length > 0 ? (

                    <ul>{phones.map((p) => <li key={p}>{p}</li>)}</ul>

                ) : (

                    <p>—</p>

                )}

                <p><strong>Direcciones:</strong></p>

                {addresses.length > 0 ? (

                    <ul>{addresses.map((a, i) => <li key={i}>{addressLabel(a)}</li>)}</ul>

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

                {orders.length > 0 && (

                    <p style={{display: "flex", gap: 8, flexWrap: "wrap"}}>

                        <select aria-label="Filtrar compras" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        
                            {["Todas", ...TRANSACTION_STATES].map((s) => <option key={s} value={s}>{s}</option>)}
                        
                        </select>

                        <button type="button" onClick={() => generateHistoryPDF(orders, "Historial de compras", () => currentUser.fullName)}>
                        
                            Descargar historial (PDF)
                        
                        </button>

                    </p>

                )}

                {shownOrders.map((order) => (

                    <div key={order.id} style={{borderTop: "1px solid #eee", paddingTop: 8, marginTop: 8}}>

                        <p><strong>Pedido #{order.id}</strong> — {order.date}</p>
                        
                        {order.sellerName && <p><strong>Vendedor:</strong> {order.sellerName}</p>}
                        
                        <p><strong>Medio de pago:</strong> {paymentSummary(order)}</p>
                        
                        <p><strong>Transacción:</strong> {transactionStatus(order)}</p>

                        {order.estado !== CANCELLED && <OrderStatusTracker estado={order.estado} />}

                        <OrderActions
                            order={order}
                            buyerRut={currentUser.rut}
                            isBuyer
                            onChange={() => setOrders(getOrders(currentUser.rut))}
                        />

                        {order.requiereDespacho !== undefined && (

                            <p><strong>Despacho:</strong> {order.requiereDespacho ? order.direccionDespacho : "Sin despacho"}</p>

                        )}

                        {order.seguimiento && (

                            <p><strong>Transporte:</strong> {order.transportista} — <strong>N° de seguimiento:</strong> {order.seguimiento}</p>

                        )}

                        {orderSellerRut(order) && orderSellerRut(order) !== currentUser.rut && (

                            <p>

                                <Link to={`/mensajes?con=${orderSellerRut(order)}&asunto=${encodeURIComponent(`Sobre el pedido #${order.id}: `)}`}>Escribir al vendedor</Link>

                            </p>

                        )}

                        <ul>

                            {order.items.map((it) => (

                                <li key={`${it.id}-${it.variantId ?? ""}`}>{it.name} x {it.quantity}</li>

                            ))}

                        </ul>

                        <p><strong>Total:</strong> {formatCLP(order.total)}</p>

                    </div>

                ))}

            </div>

        </MainTemplate>

    );

}