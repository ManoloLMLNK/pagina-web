export function formatCLP(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat("es-CL", {

        style: "currency",

        currency: "CLP",

        maximumFractionDigits: 0,

    }).format(number);

}