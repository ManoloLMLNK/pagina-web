//estas cosas nose porque se ven asi la verdad

export default function LoginTemplate ({ brand, form }) {

    return (

        <main className = "login-screen">

            <section className = "login-screen__card">

                {brand}
                {form}

            </section>

        </main>

    );

}