import { CANCELLED, ORDER_STATES, getAllOrders, orderSellerRut, refundedAmount } from "./orders";
import { getAllItems } from "../data/catalog";
import { getReviews } from "./reviews";
import { getPendingChats, getQuestions, isOverdue } from "./moderation";

//la plataforma se queda cn el 5% del valor bruto de cada venta

export const COMMISSION_RATE = 0.05;

//inventario critico menos de 10 unidades

export const CRITICAL_STOCK = 10;

const MONTHS_SHOWN = 6;

const sum = (list, pick) => list.reduce((total, x) => total + (pick(x) || 0), 0);

//lo q realmente quedo vendido

const netTotal = (order) => (order.total ?? 0) - refundedAmount(order);

const isValidSale = (order) => order.estado !== CANCELLED && order.devolucion?.estado !== "Aprobada";

//los pedidos nuevos traen createdAt los antiguos solo el texto

export function orderDate(order) {
    
    if (order.createdAt) {
    
        const d = new Date(order.createdAt);
    
        if (!Number.isNaN(d.getTime())) return d;
    
    }
    
    const m = /(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(order.date ?? "");
    
    return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;

}

//suma los montos por mes en los ultimos meses

function monthlyTotals(entries) {
    
    const now = new Date();
    
    const months = [];
    
    for (let i = MONTHS_SHOWN - 1; i >= 0; i--) {
    
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    
        months.push({
    
            key: `${d.getFullYear()}-${d.getMonth()}`,
            label: `${d.toLocaleDateString("es-CL", { month: "short" }).replace(".", "")} ${d.getFullYear()}`,
            value: 0,
        
        });
    
    }
    
    entries.forEach(({ date, amount }) => {
    
        if (!date) return;
    
        const found = months.find((m) => m.key === `${date.getFullYear()}-${date.getMonth()}`);
    
        if (found) found.value += amount;
    
    });
    
    return months.map(({ label, value }) => ({ label, value }));

}

//una fila por cada articulo comprado cn su vendedor

function buildLines(orders) {
    
    const catalog = new Map(getAllItems().map((item) => [item.id, item]));
    
    return orders.filter(isValidSale).flatMap((order) => {
    
        const date = orderDate(order);
    
        return (order.items ?? []).map((line) => ({
    
            orderKey: `${order.buyerRut}-${order.id}`,
            date,
            id: line.id,
            name: line.name,
            quantity: line.quantity,
            revenue: line.price * line.quantity,
            sellerRut: line.sellerRut ?? catalog.get(line.id)?.sellerRut ?? null,
        
        }));

    });

}

function topItems(lines, limit = 5) {

    const byId = new Map();
    
    lines.forEach((l) => {

        const entry = byId.get(l.id) ?? { label: l.name, value: 0 };
    
        entry.value += l.quantity;
    
        byId.set(l.id, entry);
    
    });
    
    return [...byId.values()].sort((a, b) => b.value - a.value).slice(0, limit);

}

//cuenta cuantas veces aparece cada nombre

function countBy(list, nameOf) {

    const counts = new Map();

    list.forEach((x) => counts.set(nameOf(x), (counts.get(nameOf(x)) ?? 0) + 1));

    return [...counts].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

}

//cada variante cn menos de 10 unidades

export function criticalStock(items) {
    
    return items
    
        .filter((i) => i.tipo === "productos")
        
        .flatMap((i) =>
        
            i.variants?.length
        
                ? i.variants.map((v) => ({ label: `${i.name} (${v.name})`, stock: v.stock }))
            
                : [{ label: i.name, stock: i.stock }]
        
        )
        
        .filter((x) => typeof x.stock === "number" && x.stock < CRITICAL_STOCK)
        
        .sort((a, b) => a.stock - b.stock);

}

//analisis operativo y de calidad sin rut se calcula para toda la plataforma

export function getOperationAndQuality(users = [], rut) {
    
    const orders = getAllOrders().filter((o) => !rut || orderSellerRut(o) === rut);
    
    const items = getAllItems().filter((i) => !rut || i.sellerRut === rut);
    
    const shipped = orders.filter((o) => o.requiereDespacho && o.estado !== CANCELLED);

    //dias entre la compra y la entrega
    
    const days = orders
    
        .map((o) => {
        
            const delivered = o.historial?.find((h) => h.estado === "Entregado");
        
            const start = orderDate(o);
        
            return delivered && start ? (new Date(delivered.fecha) - start) / 86400000 : null;
        
        })
        
        .filter((d) => d !== null);

    const reviews = items.flatMap((i) => getReviews(i.id));
    
    const delivered = orders.filter((o) => o.estado === "Entregado");
    
    const returned = delivered.filter((o) => o.devolucion?.estado === "Aprobada");

    const lowRated = items
    
        .map((i) => {
        
            const list = getReviews(i.id);
        
            return { label: i.name, value: list.length ? Math.round((sum(list, (r) => r.stars) / list.length) * 10) / 10 : 0 };
        
        })
        
        .filter((x) => x.value > 0 && x.value < 3);

    return {
        
        ordersByState: [...ORDER_STATES, CANCELLED].map((s) => ({ label: s, value: orders.filter((o) => (o.estado ?? "Recibido") === s).length })),
        byCarrier: countBy(shipped, (o) => o.transportista || "Sin asignar"),
        byRegion: countBy(shipped, (o) => o.direccionDespacho?.split(",").pop().trim() || "Sin dirección"),
        deliveryDays: days.length ? (sum(days, (d) => d) / days.length).toFixed(1) : 0,
        rating: reviews.length ? (sum(reviews, (r) => r.stars) / reviews.length).toFixed(1) : 0,
        stars: [5, 4, 3, 2, 1].map((n) => ({ label: `${n} estrellas`, value: reviews.filter((r) => r.stars === n).length })),
        returnRate: delivered.length ? Math.round((returned.length / delivered.length) * 100) : 0,
        lowRated,
        lateQuestions: getQuestions().filter((q) => (!rut || q.sellerRut === rut) && !q.reply && isOverdue(q.date)).length,
        lateChats: getPendingChats(users).filter((m) => (!rut || m.to === rut) && isOverdue(m.date)).length,
    
    };

}

export function getAdminAnalytics(users = []) {
    
    const orders = getAllOrders();
    
    const lines = buildLines(orders);
    
    const totalSold = sum(orders, netTotal);
    
    const roleCount = (role) => users.filter((u) => (u.roles ?? [u.role]).includes(role)).length;

    return {
    
        totalSold,
        commission: Math.round(totalSold * COMMISSION_RATE),
        orderCount: orders.filter(isValidSale).length,
        userCount: users.length,
        salesByMonth: monthlyTotals(orders.map((o) => ({ date: orderDate(o), amount: netTotal(o) }))),
        topItems: topItems(lines),
        usersByRole: [
    
            { label: "Compradores", value: roleCount("comprador") },
            { label: "Vendedores", value: roleCount("vendedor") },
            { label: "Administradores", value: roleCount("administrador") },
    
        ],
    
    };

}

export function getSellerAnalytics(rut) {

    const lines = buildLines(getAllOrders()).filter((l) => l.sellerRut === rut);

    const mine = getAllItems().filter((item) => item.sellerRut === rut);

    return {

        revenue: sum(lines, (l) => l.revenue),
        unitsSold: sum(lines, (l) => l.quantity),
        orderCount: new Set(lines.map((l) => l.orderKey)).size,
        itemCount: mine.length,
        salesByMonth: monthlyTotals(lines.map((l) => ({ date: l.date, amount: l.revenue }))),
        topItems: topItems(lines),
        lowStock: criticalStock(mine),

    };

}