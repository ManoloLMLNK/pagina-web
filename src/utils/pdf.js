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
        doc.text(formatCLP(item.price * item.quantity), 155);
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