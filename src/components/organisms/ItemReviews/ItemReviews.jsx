import { useState } from "react";
import { Rating } from "@mui/material";
import CustomButton from "../../atoms/Button/CustomButton";
import ConfirmDialog from "../../ConfirmDialog/Confirmdialog";
import { useAuth } from "../../../context/AuthContext";
import { hasPurchased } from "../../../utils/orders";
import { getReviews, getReviewStats, removeReview, saveReview } from "../../../utils/reviews";

const MAX_LENGTH = 300;

const VISIBLE_COUNT = 5;

const NOT_BUYER = "Solo quienes compraron esta publicación pueden dejar una reseña.";

const textareaStyle = { width: "100%", boxSizing: "border-box", padding: 8, borderRadius: 8, border: "1px solid #ccc", font: "inherit" };

function shortName(fullName) {

    const parts = (fullName ?? "").trim().split(/\s+/);

    if (!parts[0]) return "Usuario";

    return parts[1] ? `${parts[0]} ${parts[1][0].toUpperCase()}.` : parts[0];

}

function formatDate(iso) {

    return new Date(iso).toLocaleDateString("es-CL");

}

//las reseñas cn estrellas de una publicacion onChange avisa al detalle para q actualice el promedio de arriba
//solo puede reseñar quien compro esa publicacion

export default function ItemReviews({ itemId, onChange }) {

    const { currentUser } = useAuth();

    const [reviews, setReviews] = useState(() => getReviews(itemId));

    //la reseña de la persona cn sesion iniciada

    const mine = currentUser ? reviews.find((r) => r.rut === currentUser.rut) : undefined;

    //solo quien compro esta publicacion puede dejar o cambiar su reseña

    const canReview = Boolean(currentUser) && hasPurchased(currentUser.rut, itemId);

    const [stars, setStars] = useState(mine?.stars ?? 0);

    const [text, setText] = useState(mine?.text ?? "");

    const [error, setError] = useState("");

    const [showAll, setShowAll] = useState(false);

    const [toDelete, setToDelete] = useState(null);

    const stats = getReviewStats(itemId);

    const shown = showAll ? reviews : reviews.slice(0, VISIBLE_COUNT);

    //cada persona elimina la suya y el administrador puede eliminar cualquiera

    const canDelete = (review) =>

        Boolean(currentUser) && (currentUser.role === "administrador" || review.rut === currentUser.rut);

    const handleSubmit = (e) => {

        e.preventDefault();

        //aunque el formulario no se vea aqui tambien se revisa

        if (!canReview) {

            setError(NOT_BUYER);

            return;

        }

        if (stars < 1) {

            setError("Elige de 1 a 5 estrellas.");

            return;

        }

        setReviews(saveReview(itemId, { rut: currentUser.rut, author: shortName(currentUser.fullName), stars, text: text.trim() }));

        setError("");

        onChange?.();

    };

    const handleConfirmDelete = () => {

        if (toDelete) {

            setReviews(removeReview(itemId, toDelete.id));

            //si borro la suya el formulario vuelve a quedar en blanco

            if (toDelete.rut === currentUser?.rut) {

                setStars(0);

                setText("");

            }

            onChange?.();

        }

        setToDelete(null);

    };

    return (

        <section className="item-detail__panel">

            <h2 className="item-detail__subtitle">Reseñas ({reviews.length})</h2>

            {stats.count > 0 ? (

                <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 12px" }}>

                    <Rating value={stats.average} precision={0.1} readOnly />

                    <strong>{stats.average.toFixed(1)}</strong> de 5

                </p>

            ) : (

                <p>Aún no hay reseñas.</p>

            )}

            {currentUser && !canReview && (

                <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#7a7a80" }}>{NOT_BUYER}</p>

            )}

            {canReview && (

                <form onSubmit={handleSubmit} noValidate style={{ marginBottom: 16 }}>

                    <p style={{ margin: "0 0 4px", fontWeight: 600 }}>

                        {mine ? "Tu reseña (puedes cambiarla)" : "Deja tu reseña"}

                    </p>

                    <Rating

                        value={stars}
                        onChange={(e, value) => {

                            setStars(value ?? 0);

                            setError("");

                        }}

                    />

                    <textarea

                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        maxLength={MAX_LENGTH}
                        placeholder="Cuenta tu experiencia (opcional)..."
                        aria-label="Escribe tu reseña"
                        style={{ ...textareaStyle, marginTop: 8 }}

                    />

                    <p style={{ fontSize: "0.8rem", margin: "4px 0" }}>{text.length}/{MAX_LENGTH}</p>

                    {error && <p role="alert" style={{ color: "#d32f2f", margin: "4px 0" }}>{error}</p>}

                    <CustomButton type="submit">{mine ? "Actualizar reseña" : "Publicar reseña"}</CustomButton>

                </form>

            )}

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>

                {shown.map((review) => (

                    <li key={review.id} style={{ borderTop: "1px solid #eee", padding: "10px 0" }}>

                        <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

                            <strong>{review.author}</strong>

                            <Rating value={review.stars} readOnly size="small" />

                            <span style={{ fontSize: "0.8rem", color: "#777" }}>

                                {formatDate(review.date)}

                                {review.edited && " (editado)"}

                            </span>

                        </p>

                        {review.text && <p style={{ margin: "4px 0" }}>{review.text}</p>}

                        {canDelete(review) && (

                            <button type="button" onClick={() => setToDelete(review)}>Eliminar</button>

                        )}

                    </li>

                ))}

            </ul>

            {reviews.length > VISIBLE_COUNT && (

                <button type="button" onClick={() => setShowAll((prev) => !prev)}>

                    {showAll ? "Ver menos" : `Ver todas (${reviews.length})`}

                </button>

            )}

            <ConfirmDialog

                open={Boolean(toDelete)}
                title="Eliminar reseña"
                message="¿Seguro que quieres eliminar esta reseña?"
                onConfirm={handleConfirmDelete}
                onClose={() => setToDelete(null)}

            />

        </section>

    );

}