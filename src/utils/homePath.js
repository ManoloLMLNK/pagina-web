//a donde va cada persona al iniciar sesion administrador y vendedor a su panel el comprador al inicio

export function homePathFor(user) {

    return user?.role === "administrador" || user?.role === "vendedor" ? "/panel" : "/home";

}