import { useState } from "react";
import { Rating } from "@mui/material";
import CustomButton from "../../atoms/Button/CustomButton";
import { useAuth } from "../../../context/AuthContext";
import { getOrders, orderSellerRut } from "../../../utils/orders";
import { getReviews, getReviewStats, removeReview, saveReview } from "../../../utils/reviews";

//calificacion del emprendedor la puede dar quien le haya comprado alguna vez
//se guarda igual q las reseñas cn una llave propia para cada vendedor

export default function SellerRating({ sellerRut, sellerName }) {

    const { currentUser } = useAuth();

    const key = `vendedor_${sellerRut}`;

    const [reviews, setReviews] = useState(() => getReviews(key));

    const mine = reviews.find((r) => r.rut === currentUser?.rut);

    const [stars, setStars] = useState(mine?.stars ?? 0);

    const [text, setText] = useState(mine?.text ?? "");

    const [message, setMessage] = useState("");

    const stats = getReviewStats(key);

    const isSelf = currentUser?.rut === sellerRut;

    const bought = Boolean(currentUser) && !isSelf && getOrders(currentUser.rut).some((o) => o.estado !== "Cancelado" && orderSellerRut(o) === sellerRut);

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!bought) return;

        if (stars < 1) {

            setMessage("Elige de 1 a 5 estrellas.");

            return;

        }

        const author = (currentUser.fullName ?? "Usuario").split(" ")[0];

        setReviews(saveReview(key, { rut: currentUser.rut, author, stars, text: text.trim() }));

        setMessage("Calificación guardada.");

    };

    const handleDelete = (review) => {

        if (!window.confirm("¿Eliminar esta calificación?")) return;

        setReviews(removeReview(key, review.id));

        if (review.rut === currentUser?.rut) {

            setStars(0);

            setText("");

        }

        setMessage("");

    };

    return (

        <section className="item-detail__panel">
        
            <h2 className="item-detail__subtitle">Emprendedor{sellerName ? `: ${sellerName}` : ""}</h2>

            {stats.count > 0 ? (
        
                <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
                
                    <Rating value={stats.average} precision={0.1} readOnly />
                
                    <span>{stats.average.toFixed(1)} ({stats.count})</span>
                
                </p>
            
            ) : (
            
                <p>Aún no tiene calificaciones.</p>
            
            )}

            {bought ? (
            
                <form onSubmit={handleSubmit} noValidate>
                
                    <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{mine ? "Tu calificación" : "Califica al emprendedor"}</p>
                
                    <Rating value={stars} onChange={(e, value) => { setStars(value ?? 0); setMessage(""); }} />
                
                    <textarea
                
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={2}
                        maxLength={300}
                        placeholder="Comentario (opcional)"
                        aria-label="Comentario sobre el emprendedor"
                        style={{ width: "100%", boxSizing: "border-box", padding: 8, borderRadius: 8, border: "1px solid #ccc", font: "inherit", marginBottom: 8 }}
                    
                    />
                    
                    <CustomButton type="submit">Guardar calificación</CustomButton>
                
                </form>
            
            ) : (
            
                !isSelf && <p style={{ fontSize: "0.85rem", color: "#7a7a80" }}>Solo quienes le han comprado pueden calificarlo.</p>
            
            )}

            {message && <p role="status">{message}</p>}

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            
                {reviews.slice(0, 5).map((r) => (
            
                    <li key={r.id} style={{ borderTop: "1px solid #eee", padding: "8px 0" }}>
                    
                        <strong>{r.author}</strong> <Rating value={r.stars} readOnly size="small" />
                    
                        {r.text && <p style={{ margin: "4px 0" }}>{r.text}</p>}
                    
                        {(currentUser?.role === "administrador" || r.rut === currentUser?.rut) && (
                    
                            <button type="button" onClick={() => handleDelete(r)}>Eliminar</button>
                        
                        )}
                    
                    </li>
                
                ))}
            
            </ul>
        
        </section>
    
    );

}