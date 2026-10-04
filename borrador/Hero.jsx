function Hero() {

  return (

    <main className = "main-content">

        <section className = "hero">

            <h2>proyecto de compra y venta</h2>
            <p>tocnologia moviles, web y bd avanzadas</p>

            {/*una barra de busqueda cavernicola sisi*/}

            <div className = "barra-busqueda">

                <input type = "text" placeholder = "buscar"/>
                <button className = "btn-buscar">buscar</button>

            </div>

        </section>

    </main>

  );
}

export default Hero;