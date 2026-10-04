import { useState } from 'react';

function Header() {

  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => {
    
    setMenuAbierto(!menuAbierto);

  };

  return (
    
    <>

        <header className="header-red">

            <button className="btn-menu" onClick={toggleMenu}>

                menu

            </button>

{/*aqui podemos añadir mas botones pero en el lado derecho y se van a configurar "solitos"*/
/*por eso se llama nav-links porq seran botones q tendran utilidad mas adelante*/}
            <nav className = "nav-links">

                <a href = "#inicio">inicio</a>
                <a href = "#comprar">comprar</a>
                <a href = "#vender">vender</a>
                <a href = "#categorias">categorias</a>
                <a href = "#usuario" className= "btn-usuario">usuario</a>

            </nav>

        </header>

{/*aqui se añaden cosas dentro del menu deslizante y tambien aqui se creo el menu deslizante */}
        <aside className={`sidebar ${menuAbierto ? 'abierto' : ''}`}>

            <button className="btn-cerrar" onClick={toggleMenu}>

                X

            </button>

            <h3>menu</h3>

            {/*aqui vamos a poner los 4 botones pero para celular especialmente, para q se vean bonitos y no se vea feo, estaran dentro del menu deslizante */}
            <nav className = "sidebar-links">

                <a href = "#inicio">inicio</a>
                <a href = "#comprar">comprar</a>
                <a href = "#vender">vender</a>
                <a href = "#categorias">categorias</a>
                <a href = "#usuario" className= "btn-usuario">usuario</a>

            </nav>
            
        </aside>

    </>

  );
}

export default Header;