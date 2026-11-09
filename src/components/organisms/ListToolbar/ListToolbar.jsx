//titulo a la izquierda, buscador al medio y boton "+ Agregar" a la derecha.

export default function ListToolbar({

    title,
    searchPlaceholder,
    searchValue,
    onSearchChange,
    onAdd,
    addLabel = "Agregar",

}) {

    return (

        <div className="list-toolbar">

            <h1 className="list-toolbar__title">{title}</h1>

            <div className="list-toolbar__search">

                <input

                    type="text"
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}

                />

                <button type="button" aria-label="Buscar">

                    Buscar

                </button>

            </div>


            <button type="button" className="list-toolbar__add" onClick={onAdd}>

                + {addLabel}

            </button>

        </div>

    );

}