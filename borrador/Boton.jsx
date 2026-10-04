import React from 'react'
import { useState } from 'react';

function Boton() {

  const [menuAbierto, setMenuAbierto] = useState(false); /*esta parte detecta si esta abierto o cerrado el menu, osea que si es true o false*/

  const toggleMenu = () => { /* esta es la que cambia el estado eso si */

    setMenuAbierto(!menuAbierto);

  }

  return (

    /* aqui creamos la partde de activar y desactivar el menu, osea que se abra o se cierre */
    <boton className="boton-white"> 

      <button className="btn-menu" onClick={toggleMenu}>
        menú
      </button>

      /* aqui es donde se abre el manu lateral */
      <aside className={`sidebar ${menuAbierto ? 'abierto' : ''}`}>

        <button className="btn-cerrar" onClick={toggleMenu}>
          
          X

        </button>

        <h3>menú de navegación</h3>

        </aside>

    </boton>

  );
}

export default Boton;