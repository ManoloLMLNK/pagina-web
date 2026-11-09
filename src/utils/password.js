//estoy chato jiji

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

//convierte la contraseña en un hash no se puede revertir

export function hashPassword(plain) {

    return bcrypt.hashSync(plain, SALT_ROUNDS);

}

//compara lo que escribio el usuario cn el hash guardado

export function checkPassword(plain, hash) {

    if (!hash) return false;

    return bcrypt.compareSync(plain, hash);

}