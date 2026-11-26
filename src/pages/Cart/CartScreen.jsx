import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import DataTable from "../../components/organisms/DataTable/DataTable";
import CustomButton from "../../components/atoms/Button/CustomButton";
import { lineKey, useCart } from "../../context/CartContext";
import { formatCLP } from "../../utils/currency";
import { generateCartPDF } from "../../utils/pdf";
import CheckoutPanel from "../../components/organisms/CheckoutPanel/CheckoutPanel";

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

    const [payAnchor, setPayAnchor] = useState(null);

    const { items, removeItem, updateQuantity, getMaxQuantity, subtotal, iva, envio, total } = useCart();

    useEffect(() => {

        document.title = "CompraYa - Mi Carrito";

    }, []);

    //cada fila usa la llave de su linea asi dos variantes del mismo producto no se mezclan

    const rows = items.map((item) => ({ ...item, id: lineKey(item), line: item }));

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

                    <button

                        type="button"
                        disabled={row.quantity >= getMaxQuantity(row.line)}
                        onClick={() => updateQuantity(row.id, row.quantity + 1)}

                    >

                        +

                    </button>

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
                rows={rows}
                minRows={0}
                emptyMessage="Tu carrito está vacío."
                onDelete={(row) => removeItem(row.id)}

            />

            <div style={boxStyle}>

                <p>Subtotal: {formatCLP(subtotal)}</p>
                <p>IVA (19%): {formatCLP(iva)}</p>
                <p>Envío: {envio === 0 ? "Gratis" : formatCLP(envio)}</p>
                <p><strong>Total: {formatCLP(total)}</strong></p>

                <div className="cart-actions">

                    <CustomButton

                        disabled={items.length === 0}
                        onClick={(e) => setPayAnchor(e.currentTarget)}

                    >

                        Ir a Pagar

                    </CustomButton>

                    <CustomButton onClick={handleDownload}>Descargar PDF</CustomButton>

                </div>

                <p><Link to="/home">Seguir comprando</Link></p>

            </div>

            <CheckoutPanel anchorEl={payAnchor} onClose={() => setPayAnchor(null)} />

        </MainTemplate>

    );

}