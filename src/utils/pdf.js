import jsPDF from "jspdf";
import{ formatCLP } from "./currency";
import { refundedAmount, transactionStatus } from "./orders";

//lineas del medio de pago q van en el comprobante
//de la tarjeta solo se muestran los ultimos 4 digitos

function paymentLines(order) {

    const p = order.payment;

    if (!p) return [`Método de pago: ${order.paymentMethod ?? "—"}`];

    const lines = [`Método de pago: ${p.label}`];

    if (p.method === "tarjeta") lines.push(`Tarjeta: ${p.brand ? `${p.brand} ` : ""}terminada en ${p.last4}`);

    if (p.method === "transferencia") lines.push(`Código de transferencia: ${p.transferCode}`);

    return lines;

}

export function generateOrderPDF(order) {

    const {id, date, items, subtotal, iva, envio, total, sellerName} = order;

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("CompraYa", 14, 20);

    doc.setFontSize(11);
    
    doc.text(`N° de Pedido: #${id}`, 14, 32);
    
    doc.text(`Fecha: ${date}`, 14, 39);

    let y = 46;

    if (sellerName) {

        doc.text(`Vendedor: ${sellerName}`, 14, y);

        y += 7;

    }

    if (order.requiereDespacho !== undefined) {

        const lines = doc.splitTextToSize(order.requiereDespacho ? `Despacho a: ${order.direccionDespacho}` : "Sin despacho", 180);

        doc.text(lines, 14, y);

        y += lines.length * 7;

    }

    paymentLines(order).forEach((line) => {

        doc.text(line, 14, y);

        y += 7;

    });

    y += 7;

    doc.setFontSize(12);
    
    doc.text("Producto", 14, y)
    
    doc.text("Cantidad", 125, y)
    
    doc.text("Precio", 155, y)

    y += 4;

    doc.line (14, y, 196, y);

    y += 8;

    doc.setFontSize(11);

    items.forEach ((item) => {

        //los nombres largos se parten en varias lineas

        const nameLines = doc.splitTextToSize(String(item.name), 100);

        if (y + nameLines.length * 6 > 270) {

            doc.addPage();

            y = 20;

        }

        doc.text(nameLines, 14, y);
        
        doc.text(String(item.quantity), 128, y);
        
        doc.text(formatCLP(item.price * item.quantity), 155, y);

        y += nameLines.length * 6 + 2;

    });

    if (y > 240) {

        doc.addPage();

        y = 20;

    }

    y += 2;

    doc.line (14, y, 196, y);

    y += 8

    doc.text(`Valor neto (sin IVA): ${formatCLP(subtotal)}`, 120, y);
    
    y += 7;
  
    doc.text(`IVA (19%): ${formatCLP(iva)}`, 120, y);
  
    y += 7;
  
    doc.text(`Envío: ${envio === 0 ? "Gratis" : formatCLP(envio)}`, 120, y);
  
    y += 9;
  
    doc.setFontSize(13);
  
    doc.text(`Total: ${formatCLP(total)}`, 120, y);
  
    doc.save(`pedido-${id}.pdf`);

}

//pdf cn los productos del carrito su precio el iva y el total

export function generateCartPDF({ items, subtotal, iva, envio, total }) {

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("CompraYa", 14, 20);

    doc.setFontSize(11);

    doc.text("Detalle del carrito", 14, 32);
    
    doc.text(`Fecha: ${new Date().toLocaleString("es-CL")}`, 14, 39);

    let y = 53;

    doc.setFontSize(12);

    doc.text("Producto", 14, y);
    
    doc.text("Precio", 105, y);
    
    doc.text("Cant.", 140, y);
    
    doc.text("Subtotal", 165, y);

    y += 4;

    doc.line(14, y, 196, y);

    y += 8;

    doc.setFontSize(11);

    items.forEach((item) => {

        //los nombres largos se parten en varias lineas

        const nameLines = doc.splitTextToSize(String(item.name), 85);

        if (y + nameLines.length * 6 > 270) {

            doc.addPage();

            y = 20;

        }

        doc.text(nameLines, 14, y);
    
        doc.text(formatCLP(item.price), 105, y);
    
        doc.text(String(item.quantity), 143, y);
    
        doc.text(formatCLP(item.price * item.quantity), 165, y);

        y += nameLines.length * 6 + 2;

    });

    if (y > 240) {

        doc.addPage();

        y = 20;

    }

    doc.line(14, y, 196, y);

    y += 8;

    doc.text(`Subtotal: ${formatCLP(subtotal)}`, 140, y);

    y += 7;

    doc.text(`IVA (19%): ${formatCLP(iva)}`, 140, y);

    y += 7;

    doc.text(`Envío: ${envio === 0 ? "Gratis" : formatCLP(envio)}`, 140, y);

    y += 9;

    doc.setFontSize(13);

    doc.text(`Total: ${formatCLP(total)}`, 140, y);

    doc.save("carrito-compraya.pdf");

}

//historial transaccional compras motivos de devoluciones aprobadas y capital reintegrado
//personName(order) devuelve el nombre del cliente de cada pedido

export function generateHistoryPDF(orders, title, personName) {

    const doc = new jsPDF();
    
    let y = 20;

    const write = (text, size = 11, x = 14) => {

        doc.setFontSize(size);

        doc.splitTextToSize(text, 196 - x).forEach((line) => {

            if (y > 280) {
                doc.addPage();
                y = 20;
            }

            doc.text(line, x, y);
            y += 6;

        });

    };

    write("CompraYa", 18);
    
    y += 4;
    
    write(title, 13);
    
    write(`Emitido: ${new Date().toLocaleString("es-CL")}`);
    
    y += 4;

    orders.forEach((order) => {

        write(`Pedido #${order.id} - ${order.date} - ${transactionStatus(order)} (${order.estado})`, 12);
    
        write(`Cliente: ${personName(order)}   Vendedor: ${order.sellerName || "-"}`, 10, 18);
    
        (order.items ?? []).forEach((it) => write(`${it.name} x ${it.quantity}: ${formatCLP(it.price * it.quantity)}`, 10, 18));

        write(`Total pagado: ${formatCLP(order.total ?? 0)} - ${order.paymentMethod ?? "-"}`, 10, 18);

        if (order.cancelacion) write(`Motivo de cancelación: ${order.cancelacion.motivo}`, 10, 18);

        if (order.devolucion?.estado === "Aprobada") write(`Devolución aprobada. Motivo: ${order.devolucion.motivo}`, 10, 18);

        if (refundedAmount(order) > 0) write(`Reembolsado: ${formatCLP(refundedAmount(order))}`, 10, 18);

        y += 4;

    });

    const sum = (list, value) => list.reduce((total, o) => total + value(o), 0);

    const returned = orders.filter((o) => o.devolucion?.estado === "Aprobada");

    const cancelled = orders.filter((o) => o.cancelacion);

    const paid = sum(orders, (o) => o.total ?? 0);

    const refunded = sum(orders, refundedAmount);

    write("Resumen", 13);

    write(`Pedidos: ${orders.length}`);

    write(`Total pagado: ${formatCLP(paid)}`);

    write(`Reintegrado por devoluciones (${returned.length}): ${formatCLP(sum(returned, refundedAmount))}`);

    write(`Reintegrado por cancelaciones (${cancelled.length}): ${formatCLP(sum(cancelled, refundedAmount))}`);

    write(`Total neto (pagado menos reintegrado): ${formatCLP(paid - refunded)}`);

    doc.save("historial-compraya.pdf");

}