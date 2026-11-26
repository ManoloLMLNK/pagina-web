import { useEffect, useState } from "react";
import MainTemplate from "../../components/templates/MainTemplate/MainTemplate";
import ListToolbar from "../../components/organisms/ListToolbar/ListToolbar";
import CategoryFormDialog from "../../components/organisms/CategoryFormDialog/CategoryFormDialog";
import ConfirmDialog from "../../components/ConfirmDialog/Confirmdialog";
import { MAX_DEPTH, TIPOS, addCategory, getCategories, removeCategory, updateCategory } from "../../data/catalog";
import { matchesSearch } from "../../utils/search";
import "../../styles/Admin.css";
import "../../styles/Categories.css";

//el administrador crea edita y elimina categorias y subcategorias de productos y servicios
//solo se pueden editar y eliminar las creadas por el administrador

const CLOSED = { open: false, mode: "create", parent: null, target: null };

//las categorias predeterminadas traen una imagen las nuevas traen letras

function CategoryIcon({ icon }) {

    const isImage = typeof icon === "string" && icon.includes("/");

    return (

        <span className="cat-icon" aria-hidden="true">

            {isImage ? <img src={icon} alt="" /> : icon}

        </span>

    );

}

export default function CategoriesScreen() {

    const [tipo, setTipo] = useState("productos");

    const [search, setSearch] = useState("");

    const [dialog, setDialog] = useState(CLOSED);

    const [toDelete, setToDelete] = useState(null);

    const [notice, setNotice] = useState("");

    //las categorias se leen del almacenamiento en cada render este contador solo fuerza el refresco

    const [, setVersion] = useState(0);

    const refresh = () => setVersion((v) => v + 1);

    useEffect(() => {

        document.title = "CompraYa - Categorías";

    }, []);

    //nombres de una categoria y de todo lo q cuelga de ella
    
    const labelsOf = (node) => [node.label, ...node.subcategories.flatMap(labelsOf)];

    const categories = getCategories(tipo).filter((cat) => matchesSearch(labelsOf(cat), search));

    const openCreate = (parent = null) => setDialog({ open: true, mode: "create", parent, target: null });

    const openEdit = (target, parent = null) => setDialog({ open: true, mode: "edit", parent, target });

    const closeDialog = () => setDialog(CLOSED);

    const handleSave = ({ label }) => {

        const result =

            dialog.mode === "edit"

                ? updateCategory({ tipo, id: dialog.target.id, label })

                : addCategory({ tipo, label, parentId: dialog.parent?.id ?? null });

        if (result.ok) refresh();

        return result;

    };

    const handleConfirmDelete = () => {

        if (toDelete) {

            const result = removeCategory(toDelete.tipo, toDelete.id);

            if (result.ok) refresh();
            
            else setNotice(result.error);

        }

        setToDelete(null);

    };

    //dibuja las subcategorias y dentro de cada una las suyas
    
    const renderSubs = (parent, depth) => (

        <ul className="cat-sublist" style={{ flexDirection: "column", alignItems: "stretch" }}>

            {parent.subcategories.map((sub) => (

                <li key={sub.id} style={{ listStyle: "none" }}>

                    <div className="cat-subitem">

                        <span className="cat-subitem__name">
                        
                            {sub.label}
                        
                            {!sub.custom && <span className="cat-badge">Predeterminada</span>}
                        
                        </span>

                        <span className="cat-actions">

                            {depth < MAX_DEPTH && (
                            
                                <button type="button" className="cat-btn" onClick={() => openCreate(sub)}>
                            
                                    + Subcategoría
                            
                                </button>
                            
                            )}

                            {sub.custom && (
                                
                                <>
                                    
                                    <button type="button" className="cat-btn" onClick={() => openEdit(sub, parent)}>
                                    
                                        Editar
                                    
                                    </button>
                                    
                                    <button
                                    
                                        type="button"
                                        className="cat-btn cat-btn--danger"
                                        onClick={() => setToDelete({ tipo, id: sub.id, label: sub.label, isCategory: false })}
                            
                                    >
                            
                                        Eliminar
                            
                                    </button>
                            
                                </>
                            
                            )}

                        </span>

                    </div>

                    {sub.subcategories.length > 0 && (
                    
                        <div style={{ marginLeft: 24 }}>{renderSubs(sub, depth + 1)}</div>
                    
                    )}

                </li>

            ))}

        </ul>

    );

    const dialogTitle = () => {

        if (dialog.mode === "edit") {

            return dialog.parent ? "Editar subcategoría" : "Editar categoría";

        }

        return dialog.parent

            ? `Nueva subcategoría en ${dialog.parent.label}`

            : `Nueva categoría de ${TIPOS[tipo].label.toLowerCase()}`;

    };

    return (

        <MainTemplate

            toolbar={

                <ListToolbar

                    title="Categorías"
                    searchPlaceholder="Buscar categoría"
                    searchValue={search}
                    onSearchChange={setSearch}
                    onAdd={() => openCreate(null)}

                />

            }

        >

            <div className="category-tabs cat-tabs">

                <button type="button" className="cat-btn cat-btn--primary cat-btn--lg" onClick={() => openCreate(null)}>

                    + Nueva categoría de {TIPOS[tipo].label.toLowerCase()}

                </button>

                {Object.keys(TIPOS).map((key) => (

                    <button

                        key={key}
                        type="button"
                        className={`tab${tipo === key ? " active" : ""}`}
                        onClick={() => setTipo(key)}

                    >

                        {TIPOS[key].label}

                    </button>

                ))}

            </div>

            {categories.length === 0 && <p className="item-grid__empty">No se encontraron categorías.</p>}

            <div className="cat-list">

                {categories.map((cat) => (

                    <section key={cat.id} className="cat-card">

                        <header className="cat-card__head">

                            <CategoryIcon icon={cat.icon} />

                            <h3 className="cat-card__title">{cat.label}</h3>

                            {!cat.custom && <span className="cat-badge">Predeterminada</span>}

                            <div className="cat-actions">

                                <button type="button" className="cat-btn cat-btn--primary" onClick={() => openCreate(cat)}>

                                    + Subcategoría

                                </button>

                                {cat.custom && (

                                    <>

                                        <button type="button" className="cat-btn" onClick={() => openEdit(cat)}>

                                            Editar

                                        </button>

                                        <button

                                            type="button"
                                            className="cat-btn cat-btn--danger"
                                            onClick={() => setToDelete({ tipo, id: cat.id, label: cat.label, isCategory: true })}

                                        >

                                            Eliminar

                                        </button>

                                    </>

                                )}

                            </div>

                        </header>

                        {cat.subcategories.length === 0 ? (

                            <p className="cat-empty">Esta categoría aún no tiene subcategorías.</p>

                        ) : (

                            renderSubs(cat, 2)

                        )}

                    </section>

                ))}

            </div>

            <CategoryFormDialog

                open={dialog.open}
                title={dialogTitle()}
                initialLabel={dialog.mode === "edit" ? dialog.target?.label : ""}
                submitLabel={dialog.mode === "edit" ? "Guardar cambios" : "Crear"}
                onClose={closeDialog}
                onSave={handleSave}

            />

            <ConfirmDialog

                open={Boolean(toDelete)}
                title={toDelete?.isCategory ? "Eliminar categoría" : "Eliminar subcategoría"}
                message={

                    toDelete

                        ? `¿Seguro que quieres eliminar "${toDelete.label}"? También se eliminarán sus subcategorías, si tiene.`

                        : ""

                }
                
                onConfirm={handleConfirmDelete}
                onClose={() => setToDelete(null)}

            />

            <ConfirmDialog

                open={Boolean(notice)}
                title="No se pudo eliminar"
                message={notice}
                confirmLabel="Entendido"
                onConfirm={() => setNotice("")}
                onClose={() => setNotice("")}

            />

        </MainTemplate>

    );

}