import { useState } from "react";
import CustomButton from "../../atoms/Button/CustomButton";
import ConfirmDialog from "../../ConfirmDialog/Confirmdialog";
import { useAuth } from "../../../context/AuthContext";
import { addComment, getComments, removeComment } from "../../../utils/comments";

const MAX_LENGTH = 300;

const VISIBLE_COUNT = 5;

//recorta los nombres en los comentarios "Benjamin Contreras Mendez" -> "Benjamin C."

function shortName(fullName) {

    const parts = (fullName ?? "").trim().split(/\s+/);

    if (!parts[0]) return "Usuario";

    return parts[1] ? `${parts[0]} ${parts[1][0].toUpperCase()}.` : parts[0];

}

function formatDate(iso) {

    return new Date(iso).toLocaleDateString("es-CL");

}

//los comentarios de una publicacion: se ven, se agregan y se eliminan

export default function ItemComments({ itemId }) {

    const { currentUser } = useAuth();

    const [comments, setComments] = useState(() => getComments(itemId));

    const [text, setText] = useState("");

    const [error, setError] = useState("");

    const [showAll, setShowAll] = useState(false);

    const [toDelete, setToDelete] = useState(null);

    const shown = showAll ? comments : comments.slice(0, VISIBLE_COUNT);

    //cada persona elimina los suyos y el administrador puede eliminar cualquiera

    const canDelete = (comment) =>

        Boolean(currentUser) &&

        (currentUser.role === "administrador" || (comment.rut && comment.rut === currentUser.rut));

    const handleSubmit = (e) => {

        e.preventDefault();

        const clean = text.trim();

        if (!clean) {

            setError("Escribe un comentario antes de publicar.");

            return;

        }

        setComments(addComment(itemId, { author: shortName(currentUser.fullName), rut: currentUser.rut, text: clean }));

        setText("");

        setError("");

    };

    const handleConfirmDelete = () => {

        if (toDelete) setComments(removeComment(itemId, toDelete.id));

        setToDelete(null);

    };

    return (

        <section className="item-detail__panel">

            <h2 className="item-detail__subtitle">Comentarios ({comments.length})</h2>

            {currentUser && (

                <form onSubmit={handleSubmit} noValidate style={{ marginBottom: 16 }}>

                    <textarea

                        value={text}
                        onChange={(e) => {

                            setText(e.target.value);

                            setError("");

                        }}
                        rows={3}
                        maxLength={MAX_LENGTH}
                        placeholder="Escribe tu comentario..."
                        aria-label="Escribe tu comentario"
                        style={{ width: "100%", boxSizing: "border-box", padding: 8, borderRadius: 8, border: "1px solid #ccc", font: "inherit" }}

                    />

                    <p style={{ fontSize: "0.8rem", margin: "4px 0" }}>{text.length}/{MAX_LENGTH}</p>

                    {error && <p role="alert" style={{ color: "#d32f2f", margin: "4px 0" }}>{error}</p>}

                    <CustomButton type="submit">Publicar comentario</CustomButton>

                </form>

            )}

            {comments.length === 0 && <p>Aún no hay comentarios. ¡Sé la primera persona en comentar!</p>}

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>

                {shown.map((comment) => (

                    <li key={comment.id} style={{ borderTop: "1px solid #eee", padding: "10px 0" }}>

                        <p style={{ margin: 0 }}>

                            <strong>{comment.author}</strong>{" "}

                            <span style={{ fontSize: "0.8rem", color: "#777" }}>{formatDate(comment.date)}</span>

                        </p>

                        <p style={{ margin: "4px 0" }}>{comment.text}</p>

                        {canDelete(comment) && (

                            <button type="button" onClick={() => setToDelete(comment)}>Eliminar</button>

                        )}

                    </li>

                ))}

            </ul>

            {comments.length > VISIBLE_COUNT && (

                <button type="button" onClick={() => setShowAll((prev) => !prev)}>

                    {showAll ? "Ver menos" : `Ver todos (${comments.length})`}

                </button>

            )}

            <ConfirmDialog

                open={Boolean(toDelete)}
                title="Eliminar comentario"
                message="¿Seguro que quieres eliminar este comentario?"
                onConfirm={handleConfirmDelete}
                onClose={() => setToDelete(null)}

            />

        </section>

    );

}