import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconButton, Rating } from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import { useCart } from "../../../context/CartContext";
import CustomButton from "../../atoms/Button/CustomButton";
import QuantitySelector from "../../molecules/QuantitySelector/QuantitySelector";
import { useAuth } from "../../../context/AuthContext";
import { isInWishlist, toggleWishlist } from "../../../utils/wishlist";
import ItemComments from "../ItemComments/ItemComments";
import ItemReviews from "../ItemReviews/ItemReviews";
import { getReviewStats } from "../../../utils/reviews";
import { activeOffer, basePrice, categoryLabel, getVariant, priceOf } from "../../../data/catalog";
import { formatCLP } from "../../../utils/currency";
import SellerRating from "../SellerRating/SellerRating";

//datos propios de productos y servicios

function specs(item) {

    return [

        ["Categoría", categoryLabel(item)],
        ["Tamaño", item.size],
        ["Peso", item.weight ? `${item.weight} kg` : ""],
        ["Color", item.color],
        ["Material principal", item.material],
        ["Restricción de edad", item.ageRestriction ? `Mayores de ${item.ageRestriction} años` : ""],
        ["Tiempo", item.duration],

    ].filter(([, value]) => value);

}

export default function ItemDetailView({ item, typeLabel }) {

    const { addItem } = useCart();

    const { currentUser } = useAuth();

    const [selectedImage, setSelectedImage] = useState(0);

    const [quantity, setQuantity] = useState(1);

    //variante elegida
    
    const [variantId, setVariantId] = useState(item.variants?.[0]?.id);

    const variant = getVariant(item, variantId);
    
    const offer = activeOffer(item);

    const [liked, setLiked] = useState(false);

    const [added, setAdded] = useState(false);

    //mensaje cuando no se pudo agregar todo lo pediod

    const [notice, setNotice] = useState("");

    //se vuelve a calcular el promedio cada vez q alguien deja o borra una reseña

    const [, refreshStats] = useState(0);

    const stats = getReviewStats(item.id);

    const images = item.images ?? [];

    //solo los productos cn stock numerico tienen limite

    const stock = variant ? variant.stock : typeof item.stock === "number" ? item.stock : undefined;

    const soldOut = stock !== undefined && stock < 1;

    const maxQuantity = stock !== undefined ? Math.max(1, stock) : 99;

    //el corazon sale lelno si el producto ya esta en los deseados de esta cuenta

    useEffect(() => {

        if (currentUser) setLiked(isInWishlist(currentUser.rut, item.id));

    }, [currentUser, item.id]);

    const handleToggleLike = () => {

        if (!currentUser) return;

        setLiked(toggleWishlist(currentUser.rut, item.id).includes(item.id));

    };

    const handleAdd = () => {

        const result = addItem(item, quantity, variantId);

        if (!result.ok) {

            setNotice(result.message ?? "No se pudo agregar al carrito");

            setTimeout(() => setNotice(""), 3000);

            return;

        }

        setNotice(result.message ?? "");

        setAdded(true);

        setTimeout(() => {

            setAdded(false);

            setNotice("");

        }, 2000);

    };

    return (

        <div className="item-detail">

            <div className="item-detail__gallery">

                <div className="item-detail__main-image">

                    {images[selectedImage] ? (

                        <img src={images[selectedImage]} alt={item.name} />

                    ) : (

                        <span>Sin imagen</span>

                    )}

                </div>

                {images.length > 1 && (

                    <div className="item-detail__thumbs">

                        {images.map((src, i) => (

                            <button

                                key={i}
                                type="button"
                                className={`item-detail__thumb${i === selectedImage ? " active" : ""}`}
                                onClick={() => setSelectedImage(i)}
                                aria-label={`Ver imagen ${i + 1}`}

                            >

                                <img src={src} alt="" />

                            </button>

                        ))}

                    </div>

                )}

            </div>

            <div className="item-detail__side">

                <section className="item-detail__panel">

                    <h1 className="item-detail__title">{item.title ?? item.name}</h1>

                    <div className="item-detail__meta">

                        <span>

                            ID del {typeLabel}: {item.displayId}

                        </span>

                        <IconButton

                            onClick={handleToggleLike}
                            aria-label={liked ? "Quitar de la lista de deseos" : "Agregar a la lista de deseos"}

                        >

                            {liked ? <Favorite color="error" /> : <FavoriteBorder />}

                        </IconButton>

                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0", fontSize: "0.85rem", color: "#7a7a80" }}>

                        {stats.count > 0 ? (

                            <>

                                <Rating value={stats.average} precision={0.1} readOnly size="small" />

                                <span>{stats.average.toFixed(1)} ({stats.count})</span>

                            </>

                        ) : (

                            <span>Sin reseñas todavía</span>

                        )}

                    </div>

                </section>

                <section className="item-detail__panel">

                    <p style={{ margin: "0 0 8px", fontSize: "1.4rem", fontWeight: 700 }}>

                        {formatCLP(priceOf(item, variantId))}

                        {offer && (
                        
                            <span style={{ marginLeft: 8, fontSize: "0.9rem", fontWeight: 400 }}>
                        
                                <s>{formatCLP(basePrice(item, variantId))}</s>{" "}
                        
                                <strong style={{ color: "#d32f2f" }}>-{offer.percent}%</strong>
                        
                                {" "}hasta el {offer.until.split("-").reverse().join("/")}
                        
                            </span>
                        )}

                    </p>

                    {item.variants?.length > 0 && (

                        <label style={{ display: "block", marginBottom: 8 }}>
                            
                            Opción{" "}
                            
                            <select
                            
                                value={variantId}
                            
                                onChange={(e) => {
                            
                                    setVariantId(e.target.value);
                            
                                    setQuantity(1);
                            
                                }}
                                
                            >
                                
                                {item.variants.map((v) => (
                                
                                    <option key={v.id} value={v.id}>
                                
                                        {v.name} - {formatCLP(priceOf(item, v.id))}{v.stock < 1 ? " (sin stock)" : ""}
                                
                                    </option>
                        
                                ))}
                        
                            </select>
                        
                        </label>

                    )}

                    {stock !== undefined && (

                        <p

                            className="item-detail__stock"
                            style={{ margin: "0 0 8px", fontWeight: 600, color: soldOut ? "#d32f2f" : stock <= 5 ? "#ed6c02" : "#2e7d32" }}

                        >

                            {soldOut

                                ? "Sin stock"

                                : stock === 1

                                    ? "¡Última unidad disponible!"

                                    : stock <= 5

                                        ? `¡Quedan solo ${stock} unidades!`

                                        : `${stock} unidades disponibles`}

                        </p>

                    )}

                    {!soldOut && (

                        <div className="item-detail__quantity">

                            <span>Cantidad</span>

                            <QuantitySelector value={quantity} onChange={setQuantity} max={maxQuantity} />

                        </div>

                    )}

                    {notice && <p role="status" style={{ margin: "8px 0", fontSize: "0.85rem" }}>{notice}</p>}

                    <CustomButton onClick={handleAdd} disabled={soldOut}>

                        {soldOut ? "Sin stock" : added ? "Agregado al carro" : "Agregar al Carro"}

                    </CustomButton>

                    {item.sellerRut && item.sellerRut !== currentUser?.rut && (

                        <p style={{ display: "flex", justifyContent: "center", gap: 16, margin: "8px 0 0" }}>

                            <Link to={`/cotizaciones?item=${item.id}`}>Solicitar cotización</Link>

                            <Link to={`/mensajes?con=${item.sellerRut}&asunto=${encodeURIComponent(`Sobre ${item.name}: `)}`}>Preguntar al vendedor</Link>

                        </p>

                    )}

                </section>

                <section className="item-detail__panel">

                    <h2 className="item-detail__subtitle">Características</h2>

                    {specs(item).map(([name, value]) => (

                        <p key={name} style={{ margin: "4px 0" }}><strong>{name}:</strong> {value}</p>

                    ))}

                </section>

                {item.description && (

                    <section className="item-detail__panel">

                        <h2 className="item-detail__subtitle">Descripción</h2>

                        <p className="item-detail__description">{item.description}</p>

                    </section>

                )}

                {item.sellerRut && <SellerRating sellerRut={item.sellerRut} sellerName={item.sellerName} />}

                <ItemReviews key={`reviews-${item.id}-${currentUser?.rut}`} itemId={item.id} onChange={() => refreshStats((n) => n + 1)} />

                <ItemComments key={`comments-${item.id}`} itemId={item.id} />

            </div>

        </div>

    );

}