//medios de pago y como se muestran

export const PAYMENT_LABELS = {

    tarjeta: "Tarjeta de Crédito o Débito",
    transferencia: "Transferencia Bancaria",

};

//texto corto del medio de pago de un pedido
//de la tarjeta solo existen los ultimos 4 digitos

export function paymentSummary(order) {

    const p = order?.payment;

    if (!p) return order?.paymentMethod ?? "—";

    if (p.method === "tarjeta") return `${p.label} (${p.brand ? `${p.brand} ` : ""}terminada en ${p.last4})`;

    if (p.method === "transferencia") return `${p.label} (código ${p.transferCode})`;

    return p.label;

}