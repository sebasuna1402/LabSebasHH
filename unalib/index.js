const validUrl = require('valid-url');
const sanitizeHtml = require('sanitize-html');

module.exports = {
  // Valida si un número de teléfono es correcto
  is_valid_phone: function (phone) {
    var isValid = false;
    var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i;

    try {
      isValid = re.test(phone);
    } catch (e) {
      console.log(e);
    } finally {
      return isValid;
    }
  },

  // Detecta si un mensaje es una URL de video o imagen y convierte URLs de YouTube
  getEmbeddedCode: function (url) {
    if (!validUrl.isUri(url)) return sanitizeHtml(url);

    // Expresiones regulares para validar imágenes y videos
    const imgRegex = /\.(jpeg|jpg|gif|png|bmp)$/i;
    const videoRegex = /\.(mp4|webm|ogg)$/i;

    // Expresión regular para detectar URLs de YouTube y generar el iframe
    const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;

    if (imgRegex.test(url)) {
      return `<img src="${sanitizeHtml(url)}" width="300" alt="Imagen Enviada" />`;
    } else if (videoRegex.test(url)) {
      return `<video width="300" controls><source src="${sanitizeHtml(url)}" type="video/mp4">Tu navegador no soporta el video</video>`;
    } else if (youtubeRegex.test(url)) {
      // Extraer el ID del video de YouTube y crear un iframe seguro
      const videoId = url.match(youtubeRegex)[2];
      return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${sanitizeHtml(videoId)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    } else {
      // Si la URL no es de video ni de imagen, devuélvelo como texto plano.
      return sanitizeHtml(url);
    }
  },

  // Valida el mensaje y determina su tipo
  validateMessage: function (msg) {
    let obj;
    try {
      obj = JSON.parse(msg);
    } catch (e) {
      console.log("JSON inválido:", e);
      return sanitizeHtml(msg);
    }
  
    if (this.is_valid_phone(obj.mensaje)) {
      console.log("Es un teléfono.");
      obj.mensaje = `<span class="phone">${sanitizeHtml(obj.mensaje)}</span>`;
    } else {
      // Detectar si es una URL válida
      const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
      if (urlPattern.test(obj.mensaje)) {
        // Intentar incrustar la URL en el mensaje
        const embeddedContent = this.getEmbeddedCode(obj.mensaje);
        if (embeddedContent === sanitizeHtml(obj.mensaje)) {
          // Si no es una imagen o video válido, agregar mensaje de advertencia
          obj.mensaje = `<span style='color:red'>⚠️ La URL proporcionada no es una imagen o video válido: ${sanitizeHtml(obj.mensaje)}</span>`;
        } else {
          obj.mensaje = embeddedContent;
        }
      } else {
        console.log("Es texto.");
        obj.mensaje = sanitizeHtml(obj.mensaje);
      }
    }
  
    return JSON.stringify({
      nombre: sanitizeHtml(obj.nombre), 
      mensaje: obj.mensaje, 
      color: sanitizeHtml(obj.color)
    });
  }
};
