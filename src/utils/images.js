//reduce la foto para q quepa en el almacenamiento del navegador

export function fileToDataUrl(file, maxSize = 600, quality = 0.7) {

    return new Promise((resolve, reject) => {

        if (!file.type.startsWith("image/")) {

            reject(new Error("El archivo no es una imagen."));

            return;

        }

        const reader = new FileReader();

        reader.onerror = () => reject(new Error("No se pudo leer la imagen."));

        reader.onload = () => {

            const img = new Image();

            img.onerror = () => reject(new Error("No se pudo leer la imagen. Prueba con un archivo JPG o PNG."));

            img.onload = () => {

                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

                const canvas = document.createElement("canvas");

                canvas.width = Math.round(img.width * scale);

                canvas.height = Math.round(img.height * scale);

                const ctx = canvas.getContext("2d");

                //fondo blanco para q las imagenes cn transparencia no se vean niggas

                ctx.fillStyle = "#ffffff";

                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL("image/jpeg", quality));

            };

            img.src = reader.result;

        };

        reader.readAsDataURL(file);

    });

}