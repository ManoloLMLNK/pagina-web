import { useState } from "react";
import CustomButton from "../../atoms/Button/CustomButton";
import ConfirmDialog from "../../ConfirmDialog/Confirmdialog";
import { useAuth } from "../../../context/AuthContext";
import { addComment, getComments, removeComment, updateComment } from "../../../utils/comments";
import { answerComment } from "../../../utils/moderation";
import { getItemById } from "../../../data/catalog";

const MAX_LENGTH = 300;

const VISIBLE_COUNT = 5;

const textareaStyle = { width: "100%", boxSizing: "border-box", padding: 8, borderRadius: 8, border: "1px solid #ccc", font: "inherit" };

//recorta los nombres en los comentarios Benjamin Contreras Mendez a Benjamin C

function shortName(fullName) {

    const parts = (fullName ?? "").trim().split(/\s+/);

    if (!parts[0]) return "Usuario";

    return parts[1] ? `${parts[0]} ${parts[1][0].toUpperCase()}.` : parts[0];

}

function formatDate(iso) {

    return new Date(iso).toLocaleDateString("es-CL");

}

//los comentarios de una publicacion se ven se agregan se editan y se eliminan

export default function ItemComments({ itemId }) {

    const { currentUser } = useAuth();

    const [comments, setComments] = useState(() => getComments(itemId));

    const [text, setText] = useState("");

    const [error, setError] = useState("");

    const [showAll, setShowAll] = useState(false);

    const [toDelete, setToDelete] = useState(null);

    //edicion id del comentario q se esta editando y su texto

    const [editingId, setEditingId] = useState(null);

    const [editText, setEditText] = useState("");

    const [editError, setEditError] = useState("");

    //respuestas del vendedor texto por cada pregunta
    
    const [replies, setReplies] = useState({});

    const sellerRut = getItemById(itemId)?.sellerRut;

    const isSeller = Boolean(sellerRut) && sellerRut === currentUser?.rut;

    const sendReply = (comment) => {

        const clean = (replies[comment.id] ?? "").trim();

        if (!clean) return;

        answerComment(itemId, comment.id, clean);

        setComments(getComments(itemId));

    };

    const shown = showAll ? comments : comments.slice(0, VISIBLE_COUNT);

    //solo la persona que lo escribio puede editarlo

    const canEdit = (comment) =>

        Boolean(currentUser) && Boolean(comment.rut) && comment.rut === currentUser.rut;

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

    const startEdit = (comment) => {

        setEditingId(comment.id);

        setEditText(comment.text);

        setEditError("");

    };

    const cancelEdit = () => {

        setEditingId(null);

        setEditText("");

        setEditError("");

    };

    const saveEdit = (comment) => {

        const clean = editText.trim();

        if (!clean) {

            setEditError("El comentario no puede quedar vacío.");

            return;

        }

        //si no cambio nada solo se cierra la edicion

        if (clean !== comment.text) {

            setComments(updateComment(itemId, comment.id, currentUser.rut, clean));

        }

        cancelEdit();

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
                        style={textareaStyle}

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

                            <span style={{ fontSize: "0.8rem", color: "#777" }}>

                                {formatDate(comment.date)}

                                {comment.edited && " (editado)"}

                            </span>

                        </p>

                        {editingId === comment.id ? (

                            <div style={{ margin: "6px 0" }}>

                                <textarea

                                    value={editText}
                                    onChange={(e) => {

                                        setEditText(e.target.value);

                                        setEditError("");

                                    }}
                                    rows={3}
                                    maxLength={MAX_LENGTH}
                                    aria-label="Editar comentario"
                                    style={textareaStyle}

                                />

                                <p style={{ fontSize: "0.8rem", margin: "4px 0" }}>{editText.length}/{MAX_LENGTH}</p>

                                {editError && <p role="alert" style={{ color: "#d32f2f", margin: "4px 0" }}>{editError}</p>}

                                <button type="button" onClick={() => saveEdit(comment)}>Guardar</button>{" "}

                                <button type="button" onClick={cancelEdit}>Cancelar</button>

                            </div>

                        ) : (

                            <>

                                <p style={{ margin: "4px 0" }}>{comment.text}</p>

                                {canEdit(comment) && (

                                    <button type="button" onClick={() => startEdit(comment)}>Editar</button>

                                )}

                                {canEdit(comment) && canDelete(comment) && " "}

                                {canDelete(comment) && (

                                    <button type="button" onClick={() => setToDelete(comment)}>Eliminar</button>

                                )}

                            </>

                        )}

                    
                        {comment.reply && (

                            <p style={{ margin: "4px 0 4px 16px", paddingLeft: 8, borderLeft: "3px solid #5f4b8b" }}>

                                <strong>Respuesta del vendedor:</strong> {comment.reply.text}

                            </p>

                        )}

                        {isSeller && !comment.reply && comment.rut && comment.rut !== sellerRut && (

                            <div style={{ marginTop: 6 }}>

                                <textarea
                                    
                                    rows={2}
                                    maxLength={MAX_LENGTH}
                                    value={replies[comment.id] ?? ""}
                                    onChange={(e) => setReplies({ ...replies, [comment.id]: e.target.value })}
                                    placeholder="Responder públicamente..."
                                    aria-label="Respuesta"
                                    style={textareaStyle}
                                
                                />

                                <button type="button" onClick={() => sendReply(comment)}>Responder</button>

                            </div>

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