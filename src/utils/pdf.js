import jsPDF from "jspdf";
import{ formatCLP } from "./currency";

export function generateOrderPDF(order) {

    const {id, date, items, subtotal, iva, envio, total, paymentMethod} = order;

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("CompraYa", 14, 20);

    doc.setFontSize(11);
    doc.text(`N° de Pedido: #${id}`, 14, 32);
    doc.text(`Fecha: ${date}`, 14, 39);
    doc.text(`Método de pago: ${paymentMethod}`, 14, 46);

    let y = 60;

    doc.setFontSize(12);
    doc.text("Producto", 14, y)
    doc.text("Cantidad", 125, y)
    doc.text("Precio", 155, y)

    y += 4;

    doc.line (14, y, 196, y);

    y += 8;

    doc.setFontSize(11);

    items.forEach ((item) => {

        doc.text (item.name, 14, y);
        doc.text(String(item.quantity), 128, y);
        doc.text(formatCLP(item.price * item.quantity), 155, y);
            y += 8;

    });

    y += 4;

    doc.line (14, y, 196, y);

    y += 8

    doc.text(`Subtotal: ${formatCLP(subtotal)}`, 140, y);
    
    y += 7;
  
    doc.text(`IVA: ${formatCLP(iva)}`, 140, y);
  
    y += 7;
  
    doc.text(`Envío: ${envio === 0 ? "Gratis" : formatCLP(envio)}`, 140, y);
  
    y += 9;
  
    doc.setFontSize(13);
  
    doc.text(`Total: ${formatCLP(total)}`, 140, y);
  
    doc.save(`pedido-${id}.pdf`);

}

//pdf con los productos del carrito, su precio, el iva y el total

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