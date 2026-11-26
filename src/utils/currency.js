export function formatCLP(value) {

    const amount = Math.round(Number(value) || 0);

    const digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${amount < 0 ? "-" : ""}$${digits}`;

}