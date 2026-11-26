import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import { useAuth } from "../../context/AuthContext";
import { removeComment } from "../../utils/comments";
import { getMessages, getPendingChats, getQuestions, hoursSince, isOverdue, removeMessage } from "../../utils/moderation";

const boxStyle = { border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 8, background: "#fff", overflowWrap: "anywhere" };

const Late = ({ date }) => (
    
    <span style={{ background: "#d32f2f", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: "0.75rem" }}>
    
        Sin respuesta hace {hoursSince(date)} h
    
    </span>

);

//el administrador mira preguntas y mensajes el vendedor ve los suyos

export default function ModerationScreen() {
    
    const { currentUser, users } = useAuth();
    
    const [onlyLate, setOnlyLate] = useState(false);
    
    const [, setVersion] = useState(0);

    useEffect(() => {
        
        document.title = "CompraYa - Preguntas y mensajes";
    
    }, []);

    if (!currentUser) return null;

    const isAdmin = currentUser.role === "administrador";
    
    const userName = (rut) => users.find((u) => u.rut === rut)?.fullName ?? rut;
    
    const isLate = (x) => !x.reply && isOverdue(x.date);

    const questions = getQuestions().filter((q) => (isAdmin || q.sellerRut === currentUser.rut) && (!onlyLate || isLate(q)));

    const pending = getPendingChats(users);
    
    const isPending = (m) => pending.some((p) => p.date === m.date && p.from === m.from && p.to === m.to);

    const messages = getMessages()
        
        .filter((m) => isAdmin || m.from === currentUser.rut || m.to === currentUser.rut)
        
        .filter((m) => !onlyLate || (isPending(m) && isOverdue(m.date)))
        
        .reverse();

    const remove = (action) => {
        
        if (!window.confirm("¿Eliminar definitivamente?")) return;
        
        action();
        
        setVersion((v) => v + 1);
    
    };

    return (
    
        <MainTemplate>
        
            <h2 className="section-title">Preguntas y mensajes</h2>

            <label>
        
                <input type="checkbox" checked={onlyLate} onChange={(e) => setOnlyLate(e.target.checked)} /> Solo las que superan 48 horas sin respuesta
        
            </label>

            <h3 className="section-title">Preguntas públicas ({questions.length})</h3>
        
            {questions.length === 0 && <p>No hay registros.</p>}
        
            {questions.map((q) => (
        
                <div key={`${q.itemId}-${q.id}`} style={boxStyle}>
                
                    <p style={{ margin: 0 }}>
                
                        <strong>{q.author}</strong> en <Link to={`/item/${q.itemId}`}>{q.itemName}</Link> {isLate(q) && <Late date={q.date} />}
                
                    </p>
                
                    <p style={{ margin: "4px 0" }}>{q.text}</p>
                
                    <p style={{ margin: "4px 0", color: "#777" }}>{q.reply ? `Respuesta: ${q.reply.text}` : "Sin responder"}</p>
                
                    {isAdmin && (
                
                        <button type="button" onClick={() => remove(() => removeComment(q.itemId, q.id))}>Eliminar</button>
                    
                    )}
                
                </div>
            
            ))}

            <h3 className="section-title">Mensajes privados ({messages.length})</h3>
            
            {messages.length === 0 && <p>No hay registros.</p>}
            
            {messages.map((m) => (
            
                <div key={`${m.date}-${m.from}`} style={boxStyle}>
                
                    <p style={{ margin: 0 }}>
                
                        <strong>{userName(m.from)}</strong> para <strong>{userName(m.to)}</strong> {isPending(m) && isOverdue(m.date) && <Late date={m.date} />}
                
                    </p>
                
                    <p style={{ margin: "4px 0" }}>{m.text}</p>
                
                    {m.to === currentUser.rut && <Link to={`/mensajes?con=${m.from}`}>Responder</Link>}{" "}
                
                    {isAdmin && <button type="button" onClick={() => remove(() => removeMessage(m))}>Eliminar</button>}
                
                </div>
            
            ))}
        
        </MainTemplate>
    
    );

}