import {Link} from "react-router-dom";
import {useCart} from "../../../context/CartContext";
import {formatCLP} from "../../../utils/currency";
import carritoIcon from "../../../assets/icons/carrito.png";

export default function ItemCard({item}) {

    const {addItem} = useCart();

    return (

        <div className = "card">

            <Link to = {`/item/${item.id}`} className = "card-link">
            
                <div className = "card-image">

                    {item.images?.[0] && <img src = {item.images[0]} alt = {item.name} />}

                </div>

                <p className = "card-name">{item.name}</p>
                <p className = "card-rating">

                    estrella {item.rating} ({item.reviews})

                </p>

            </Link>

            <div className = "card-footer">

                <span className = "card-price">{formatCLP(item.price)}</span>

                <button

                    type = "button"

                    className = "add-to-cart"

                    aria-label = {`Agregar ${item.name} al carrito`}

                    onClick = {() => addItem(item)}

                >

                    <img src = {carritoIcon} alt = "" style = {{width: 16, height: 16}} />

                </button>

            </div>

        </div>

    );

}