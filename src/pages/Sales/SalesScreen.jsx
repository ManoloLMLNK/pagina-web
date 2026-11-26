import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import { useAuth } from "../../context/AuthContext";
import { CANCELLED, ORDER_STATES, getAllOrders, orderSellerRut, refundedAmount, transactionStatus, updateOrderStatus } from "../../utils/orders";
import OrderActions from "../../components/molecules/OrderActions/OrderActions";
import { generateHistoryPDF } from "../../utils/pdf";
import { paymentSummary } from "../../utils/payment";
import { formatCLP } from "../../utils/currency";
import { matchesSearch } from "../../utils/search";
import ShippingRates from "../../components/molecules/ShippingRates/ShippingRates";
import TrackingForm from "../../components/molecules/TrackingForm/TrackingForm";
import "../../styles/Admin.css";

const inputStyle = {

    height: 34,
    padding: "0 12px",
    border: "1px solid #ececf0",
    borderRadius: 999,
    background: "#ffffff",
    font: "inherit",
    fontSize: "0.85rem",

};

//historial de ventas el vendedor ve las suyas y cambia el estado del pedido

export default function SalesScreen() {

    const { currentUser, users } = useAuth();

    const [search, setSearch] = useState("");

    const [stateFilter, setStateFilter] = useState("todos");

    const [notice, setNotice] = useState("");

    const [, setVersion] = useState(0);

    useEffect(() => {

        document.title = "CompraYa - Ventas";

    }, []);

    if (!currentUser) return null;

    const isAdmin = currentUser.role === "administrador";

    const buyerName = (order) => users.find((u) => u.rut === order.buyerRut)?.fullName ?? order.buyerRut;

    const sales = getAllOrders()

        .filter((order) => isAdmin || orderSellerRut(order) === currentUser.rut)

        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));

    const rows = sales

        .filter((order) => stateFilter === "todos" || order.estado === stateFilter)

        .filter((order) => matchesSearch([String(order.id), buyerName(order)], search));

    const totalSold = sales.reduce((sum, order) => sum + (order.total ?? 0) - refundedAmount(order), 0);

    const handleStatusChange = (order, estado) => {

        const result = updateOrderStatus(order.buyerRut, order.id, estado);

        setNotice(result.ok ? "" : result.error);

        setVersion((v) => v + 1);

    };

    return (

        <MainTemplate>

            <h2 className="section-title">{isAdmin ? "Historial de ventas" : "Mis ventas"}</h2>

            <p>

                <strong>{sales.length}</strong> {sales.length === 1 ? "pedido" : "pedidos"} · Total vendido:{" "}

                <strong>{formatCLP(totalSold)}</strong> (con IVA, sin reembolsos)

            </p>

            <button type="button" disabled={sales.length === 0} onClick={() => generateHistoryPDF(sales, "Historial de ventas", buyerName)}>
                
                Descargar historial (PDF)
            
            </button>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "12px 0" }}>

                <input

                    type="text"
                    placeholder="Buscar por N° de pedido o comprador"
                    aria-label="Buscar ventas"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ ...inputStyle, minWidth: 260 }}

                />

                <select

                    aria-label="Filtrar por estado"
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    style={inputStyle}

                >

                    <option value="todos">Todos los estados</option>

                    {[...ORDER_STATES, CANCELLED].map((state) => (

                        <option key={state} value={state}>{state}</option>

                    ))}

                </select>

            </div>

            <ShippingRates sellerRut={currentUser.rut} />

            {notice && <p role="alert" style={{ color: "#d32f2f" }}>{notice}</p>}

            <div className="data-table__wrapper">

                <table className="data-table">

                    <thead>

                        <tr>

                            <th>Pedido</th>
                            <th>Fecha</th>
                            <th>Comprador</th>
                            <th>Productos</th>
                            <th>Total</th>
                            <th>Medio de pago</th>
                            <th>Despacho</th>
                            <th>Estado</th>

                        </tr>

                    </thead>

                    <tbody>

                        {rows.map((order) => {

                            const currentIndex = ORDER_STATES.indexOf(order.estado);

                            return (

                                <tr key={`${order.buyerRut}-${order.id}`}>

                                    <td>#{order.id}</td>
                                    <td>{order.date}</td>
                                    <td>

                                        {buyerName(order)}

                                        {orderSellerRut(order) === currentUser.rut && order.buyerRut !== currentUser.rut && (

                                            <div>

                                                <Link to={`/mensajes?con=${order.buyerRut}&asunto=${encodeURIComponent(`Sobre el pedido #${order.id}: `)}`}>Escribir</Link>

                                            </div>

                                        )}

                                    </td>

                                    <td style={{ whiteSpace: "normal", textAlign: "left" }}>

                                        {(order.items ?? []).map((it) => `${it.name} x ${it.quantity}`).join(", ")}

                                    </td>

                                    <td>{formatCLP(order.total ?? 0)}</td>
                                    
                                    <td style={{ whiteSpace: "normal" }}>{paymentSummary(order)}</td>

                                    <td style={{ whiteSpace: "normal", textAlign: "left" }}>

                                        {order.requiereDespacho ? order.direccionDespacho : "Sin despacho"}

                                        {order.requiereDespacho && order.estado !== CANCELLED && orderSellerRut(order) === currentUser.rut && <TrackingForm order={order} />}

                                    </td>

                                    <td>

                                        <strong>{transactionStatus(order)}</strong>

                                        <div>

                                        {order.estado === CANCELLED ? "Cancelado" : (

                                        <select

                                            aria-label={`Estado del pedido ${order.id}`}
                                            value={order.estado}
                                            onChange={(e) => handleStatusChange(order, e.target.value)}
                                            style={inputStyle}

                                        >

                                            {ORDER_STATES.map((state, index) => (

                                                <option key={state} value={state} disabled={index < currentIndex}>

                                                    {state}

                                                </option>

                                            ))}

                                        </select>

                                        )}

                                        </div>

                                        <OrderActions
                                            
                                            order={order}
                                            buyerRut={order.buyerRut}
                                            isSeller={isAdmin || orderSellerRut(order) === currentUser.rut}
                                            onChange={() => setVersion((v) => v + 1)}
                                        
                                        />

                                    </td>

                                </tr>

                            );

                        })}

                    </tbody>

                </table>

                {rows.length === 0 && (

                    <p className="data-table__empty">

                        {sales.length === 0 ? "Todavía no tienes ventas." : "No se encontraron ventas con ese filtro."}

                    </p>

                )}

            </div>

            <p style={{ marginTop: 16 }}>

                <Link to="/panel">Volver al panel</Link>

            </p>

        </MainTemplate>

    );

}