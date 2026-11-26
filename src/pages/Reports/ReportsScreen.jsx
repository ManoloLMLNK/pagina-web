import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import { useAuth } from "../../context/AuthContext";
import { CANCELLED, TRANSACTION_STATES, getAllOrders, orderSellerRut, refundedAmount, transactionStatus } from "../../utils/orders";
import { orderDate } from "../../utils/analytics";
import { getPendingChats, getQuestions, hoursSince } from "../../utils/moderation";
import { generateHistoryPDF } from "../../utils/pdf";
import { formatCLP } from "../../utils/currency";
import { matchesSearch } from "../../utils/search";
import "../../styles/Admin.css";

const inputStyle = { padding: "6px 10px", border: "1px solid #ccc", borderRadius: 8, font: "inherit" };

function Table({ head, rows }) {

    if (rows.length === 0) return <p>No hay registros.</p>;

    return (

        <div className="data-table__wrapper" style={{ overflowX: "auto" }}>
            
            <table className="data-table">
            
                <thead>
            
                    <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
            
                </thead>
            
                <tbody>
                    
                    {rows.map((row, i) => (
                    
                        <tr key={i}>{row.map((cell, j) => <td key={j} style={{ whiteSpace: "normal" }}>{cell}</td>)}</tr>
                    
                    ))}
                
                </tbody>
            
            </table>
        
        </div>
    
    );

}

//panel de consultas cn filtros el administrador ve todo y el vendedor solo lo suyo

export default function ReportsScreen() {
    
    const { currentUser, users } = useAuth();
    
    const [filters, setFilters] = useState({ from: "", to: "", product: "", status: "Todas" });

    useEffect(() => {
    
        document.title = "CompraYa - Reportes";
    
    }, []);

    if (!currentUser) return null;

    const isAdmin = currentUser.role === "administrador";
    
    const userName = (rut) => users.find((u) => u.rut === rut)?.fullName ?? rut;
    
    const set = (field) => (e) => setFilters({ ...filters, [field]: e.target.value });

    const inRange = (date) =>
    
        (!filters.from || (date && date >= new Date(`${filters.from}T00:00:00`))) &&
    
        (!filters.to || (date && date <= new Date(`${filters.to}T23:59:59`)));

    const matchesProduct = (name) => !filters.product.trim() || matchesSearch([name], filters.product);

    const orders = getAllOrders()
    
        .filter((o) => isAdmin || orderSellerRut(o) === currentUser.rut)
        
        .filter((o) => inRange(orderDate(o)))
        
        .filter((o) => filters.status === "Todas" || transactionStatus(o) === filters.status)
        
        .filter((o) => !filters.product.trim() || (o.items ?? []).some((it) => matchesProduct(it.name)));

    //agrupacion por empresa de nvio
    
    const carriers = new Map();
    
    orders
        
        .filter((o) => o.requiereDespacho && o.estado !== CANCELLED)
        
        .forEach((o) => {
        
            const name = o.transportista || "Sin asignar";
        
            const group = carriers.get(name) ?? { count: 0, total: 0 };
        
            carriers.set(name, { count: group.count + 1, total: group.total + (o.total ?? 0) });
        
        });

    const noTracking = orders.filter((o) => o.requiereDespacho && o.estado !== CANCELLED && !o.seguimiento);
    
    const returns = orders.filter((o) => o.devolucion?.estado === "Aprobada");
    
    const refunded = orders.reduce((sum, o) => sum + refundedAmount(o), 0);

    const questions = getQuestions().filter(
    
        (q) => !q.reply && (isAdmin || q.sellerRut === currentUser.rut) && inRange(new Date(q.date)) && matchesProduct(q.itemName)
    
    );

    const chats = getPendingChats(users).filter((m) => (isAdmin || m.to === currentUser.rut) && inRange(new Date(m.date)));

    const itemsText = (o) => (o.items ?? []).map((it) => `${it.name} x ${it.quantity}`).join(", ");

    return (
    
        <MainTemplate>
        
            <h2 className="section-title">Reportes y consultas</h2>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        
                <label>Desde <input type="date" style={inputStyle} value={filters.from} onChange={set("from")} /></label>
        
                <label>Hasta <input type="date" style={inputStyle} value={filters.to} onChange={set("to")} /></label>
        
                <input style={inputStyle} placeholder="Buscar producto" aria-label="Buscar producto" value={filters.product} onChange={set("product")} />
        
                <select style={inputStyle} aria-label="Estado" value={filters.status} onChange={set("status")}>
        
                    {["Todas", ...TRANSACTION_STATES].map((s) => <option key={s} value={s}>{s}</option>)}
        
                </select>
        
                <button type="button" onClick={() => setFilters({ from: "", to: "", product: "", status: "Todas" })}>Limpiar filtros</button>
        
                <button type="button" disabled={orders.length === 0} onClick={() => generateHistoryPDF(orders, "Reporte de transacciones", (o) => userName(o.buyerRut))}>
        
                    Exportar PDF
        
                </button>
        
            </div>

            <h3 className="section-title">Transacciones ({orders.length})</h3>
        
            <Table
        
                head={["Pedido", "Fecha", "Cliente", "Productos", "Estado", "Total"]}
                
                rows={orders.map((o) => [`#${o.id}`, o.date, userName(o.buyerRut), itemsText(o), transactionStatus(o), formatCLP(o.total ?? 0)])}
            
            />

            <h3 className="section-title">Por empresa de transporte</h3>
            
            <Table
            
                head={["Empresa", "Pedidos", "Monto"]}
                
                rows={[...carriers].map(([name, g]) => [name, g.count, formatCLP(g.total)])}
            
            />

            <h3 className="section-title">Devoluciones aprobadas ({returns.length})</h3>
            
            <p>Capital reintegrado (devoluciones y cancelaciones): <strong>{formatCLP(refunded)}</strong></p>
            
            <Table
            
                head={["Pedido", "Cliente", "Productos", "Motivo", "Reembolso"]}
                
                rows={returns.map((o) => [`#${o.id}`, userName(o.buyerRut), itemsText(o), o.devolucion.motivo, formatCLP(refundedAmount(o))])}
            
            />

            <h3 className="section-title">Registros pendientes (datos vacíos)</h3>

            <h4>Despachos sin número de seguimiento</h4>
            
            <Table head={["Pedido", "Cliente", "Estado"]} rows={noTracking.map((o) => [`#${o.id}`, userName(o.buyerRut), o.estado])} />

            <h4>Preguntas sin respuesta</h4>
            
            <Table
            
                head={["Producto", "Pregunta", "Horas"]}
            
                rows={questions.map((q) => [<Link to={`/item/${q.itemId}`}>{q.itemName}</Link>, q.text, hoursSince(q.date)])}
            
            />

            <h4>Mensajes sin respuesta</h4>
            
            <Table head={["De", "Para", "Mensaje", "Horas"]} rows={chats.map((m) => [userName(m.from), userName(m.to), m.text, hoursSince(m.date)])} />
        
        </MainTemplate>
    
    );

}