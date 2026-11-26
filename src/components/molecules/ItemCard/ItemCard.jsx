import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Rating, Snackbar} from "@mui/material";
import {useCart} from "../../../context/CartContext";
import {formatCLP} from "../../../utils/currency";
import {getReviewStats} from "../../../utils/reviews";
import {activeOffer, priceOf} from "../../../data/catalog";
import carritoIcon from "../../../assets/icons/carrito.png";

export default function ItemCard({item}) {

    const {addItem} = useCart();

    const navigate = useNavigate();

    //avisa por ejemplo cuando el carrito ya tiene productos de otro vendedor o no queda stock

    const [message, setMessage] = useState("");

    const stats = getReviewStats(item.id);

    const hasStock = typeof item.stock === "number";

    const soldOut = hasStock && item.stock < 1;

    const offer = activeOffer(item);

    const hasVariants = item.variants?.length > 0;

    const handleAdd = () => {

        //cn variantes hay q elegir una en el detalle

        if (hasVariants) {

            navigate(`/item/${item.id}`);

            return;

        }

        const result = addItem(item);

        if (result?.message) setMessage(result.message);

    };

    return (

        <div className = "card">

            <Link to = {`/item/${item.id}`} className = "card-link">

                <div className = "card-image">

                    {item.images?.[0] && <img src = {item.images[0]} alt = {item.name} />}

                </div>

                <p className = "card-name">{item.name}</p>

                <p className = "card-rating">

                    {stats.count > 0 ? (

                        <>

                            <Rating value = {stats.average} precision = {0.1} readOnly size = "small" />

                            {" "}({stats.count})

                        </>

                    ) : (

                        "Sin reseñas"

                    )}

                </p>

                {offer && (

                    <p style = {{margin: "2px 0", fontSize: "0.75rem", color: "#d32f2f", fontWeight: 600}}>

                        Oferta -{offer.percent}% <s style = {{color: "#777", fontWeight: 400}}>{formatCLP(item.price)}</s>

                    </p>

                )}

                {hasStock && (

                    <p style = {{margin: "2px 0", fontSize: "0.75rem", color: soldOut ? "#d32f2f" : "#2e7d32"}}>

                        {soldOut ? "Sin stock" : `Stock: ${item.stock}`}

                    </p>

                )}

            </Link>

            <div className = "card-footer">

                <span className = "card-price">{hasVariants ? "Desde " : ""}{formatCLP(priceOf(item))}</span>

                <button

                    type = "button"

                    className = "add-to-cart"

                    aria-label = {hasVariants ? `Ver opciones de ${item.name}` : `Agregar ${item.name} al carrito`}

                    disabled = {soldOut}

                    onClick = {handleAdd}

                >

                    <img src = {carritoIcon} alt = "" style = {{width: 16, height: 16}} />

                </button>

            </div>

            <Snackbar

                open = {Boolean(message)}
                autoHideDuration = {4000}
                onClose = {() => setMessage("")}
                message = {message}

            />

        </div>

    );

}