//calculo de Luhn (es basicamente para calcular si la tarjeta ingresada es visa o mastercard)
//lo añadimos porq nos parece interesante

export function isValidCardNumber( number ) {

    const digits = number.replace(/\D/g, "");

    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {

        let digit = Number(digits[i]);

        if (shouldDouble) {

            digit *= 2;

            if (digit > 9) digit -= 9;

        }

        sum += digit;

        shouldDouble = !shouldDouble;

    }

    return sum % 10 === 0;

}

export function getCardBrand ( number ) {

    const digits = number.replace(/\D/g, "");

    if (/^4/.test(digits)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
    
    return null;

}