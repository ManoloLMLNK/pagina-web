import jsPDF from "jspdf";
import { formatCLP } from "./currency";
import { getStatus, getTotals } from "./quotes";

const date = (iso) => new Date(iso).toLocaleDateString("es-CL");

export function generateQuotePDF(quote, clientName, sellerName) {

    const doc = new jsPDF();

    let y = 20;

    //escribe una linea y pasa de hoja si hace falta

    const line = (text, x = 14) => {

        const lines = doc.splitTextToSize(String(text), 196 - x);

        if (y + lines.length * 6 > 280) {

            doc.addPage();

            y = 20;

        }

        doc.text(lines, x, y);

        y += lines.length * 6 + 1;

    };

    doc.setFontSize(18);

    line("CompraYa - Cotización");

    y += 4;

    doc.setFontSize(11);

    line(`N°: ${quote.id}`);
    
    line(`Estado: ${getStatus(quote)}`);
    
    line(`Cliente: ${clientName}`);
    
    line(`Vendedor: ${sellerName}`);
    
    line(`Solicitada: ${date(quote.createdAt)}`);
    
    line(`Respondida: ${date(quote.answeredAt)}`);
    
    line(`Válida hasta: ${date(quote.expiresAt)}`);

    y += 6;

    quote.items.forEach((it) => line(`${it.name} - ${it.quantity} x ${formatCLP(it.price)} = ${formatCLP(it.price * it.quantity)}`));

    const { subtotal, iva, total } = getTotals(quote.items);

    y += 6;

    line(`Valor neto: ${formatCLP(subtotal)}`, 120);
    
    line(`IVA (19%): ${formatCLP(iva)}`, 120);
    
    line(`Total: ${formatCLP(total)}`, 120);

    if (quote.answer) {

        y += 6;

        line(`Respuesta del vendedor: ${quote.answer}`);

    }

    doc.save(`cotizacion-${quote.id}.pdf`);

}