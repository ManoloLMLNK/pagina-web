import { useEffect } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import DataTable from "../../components/organisms/DataTable/DataTable";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { useCart } from "../../context/CartContext";
import { formatCLP } from "../../utils/currency";
import { generateCartPDF } from "../../utils/pdf";

const boxStyle = {

    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    margin: "16px 0",
    background: "#fff",
    maxWidth: 360,

};

//el carrito completo en su propia ventana

export default function CartScreen() {

    const { items, removeItem, updateQuantity, subtotal, iva, envio, total } = useCart();

    useEffect(() => {

        document.title = "CompraYa - Mi Carrito";

    }, []);

    const columns = [

        { key: "name", label: "Producto" },

        { key: "price", label: "Precio", render: (row) => formatCLP(row.price) },

        {

            key: "quantity",
            label: "Cantidad",
            render: (row) => (

                <span>

                    <button type="button" onClick={() => updateQuantity(row.id, row.quantity - 1)}>-</button>

                    {" "}{row.quantity}{" "}

                    <button type="button" onClick={() => updateQuantity(row.id, row.quantity + 1)}>+</button>

                </span>

            ),

        },

        { key: "subtotal", label: "Subtotal", render: (row) => formatCLP(row.price * row.quantity) },

    ];

    const handleDownload = () => {

        if (items.length === 0) return;

        generateCartPDF({ items, subtotal, iva, envio, total });

    };

    return (

        <MainTemplate>

            <h2 className="section-title">Mi Carrito</h2>

            <DataTable

                columns={columns}
                rows={items}
                minRows={0}
                emptyMessage="Tu carrito está vacío."
                onDelete={(row) => removeItem(row.id)}

            />

            <div style={boxStyle}>

                <p>Subtotal: {formatCLP(subtotal)}</p>
                <p>IVA (19%): {formatCLP(iva)}</p>
                <p>Envío: {envio === 0 ? "Gratis" : formatCLP(envio)}</p>
                <p><strong>Total: {formatCLP(total)}</strong></p>

                <CustomButton onClick={handleDownload}>Descargar PDF</CustomButton>

                <p><Link to="/home">Seguir comprando</Link></p>

            </div>

        </MainTemplate>

    );

}