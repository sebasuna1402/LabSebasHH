var unalib = require('../unalib/index');
var assert = require('assert');

// Pruebas
describe('unalib', function () {
  
  // Dentro de 'unalib', vamos a probar una función específica
  describe('función is_valid_phone', function () {
    it('debería devolver true para 8297-8547', function () {
      assert.equal(unalib.is_valid_phone('8297-8547'), true);
    });

    it('debería devolver true para un número internacional: +50682978547', function () {
      assert.equal(unalib.is_valid_phone('+50682978547'), true);
    });

    it('debería devolver false para un número inválido: abc12345', function () {
      assert.equal(unalib.is_valid_phone('abc12345'), false);
    });
  });

  // Pruebas para validar URLs y detección de imágenes/videos
  describe('función getEmbeddedCode', function () {
    it('debería devolver un código de imagen para una URL de imagen válida', function () {
      const url = 'https://example.com/image.jpg';
      const result = unalib.getEmbeddedCode(url);
      assert.equal(result, '<img src="https://example.com/image.jpg" width="300" alt="Imagen Enviada" />');
    });

    it('debería devolver un código de video para una URL de video válida', function () {
      const url = 'https://example.com/video.mp4';
      const result = unalib.getEmbeddedCode(url);
      assert.equal(result, '<video width="300" controls><source src="https://example.com/video.mp4" type="video/mp4">Tu navegador no soporta el video</video>');
    });

    it('debería devolver un código de iframe para una URL de YouTube válida', function () {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = unalib.getEmbeddedCode(url);
      assert.equal(result, '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>');
    });

    it('debería devolver texto plano si la URL no es una imagen, video ni YouTube', function () {
      const url = 'https://example.com';
      const result = unalib.getEmbeddedCode(url);
      assert.equal(result, 'https://example.com');
    });

    it('debería sanitizar URLs para prevenir scripts maliciosos', function () {
      const url = 'javascript:alert("XSS")';
      const result = unalib.getEmbeddedCode(url);
      assert.equal(result, 'javascript:alert("XSS")'); // Debería devolver la URL sanitizada como texto plano
    });
  });

  // Pruebas para la función validateMessage
  describe('función validateMessage', function () {
    it('debería sanitizar un mensaje JSON con nombre y mensaje', function () {
      const msg = JSON.stringify({
        nombre: '<script>alert("hack")</script>',
        mensaje: '<b>Hola</b>',
        color: 'red'
      });
      const result = JSON.parse(unalib.validateMessage(msg));
      assert.equal(result.nombre, '');
      assert.equal(result.mensaje, '<b>Hola</b>'); // El contenido del mensaje debería sanitizarse correctamente
      assert.equal(result.color, 'red');
    });

    it('debería detectar un número de teléfono en el mensaje y formatearlo', function () {
      const msg = JSON.stringify({
        nombre: 'Juan',
        mensaje: '8297-8547',
        color: 'blue'
      });
      const result = JSON.parse(unalib.validateMessage(msg));
      assert.equal(result.mensaje, '<span class="phone">8297-8547</span>');
    });

    it('debería detectar una URL y devolver un mensaje de advertencia si no es una imagen o video', function () {
      const msg = JSON.stringify({
        nombre: 'Pedro',
        mensaje: 'https://malicious-site.com',
        color: 'green'
      });
      const result = JSON.parse(unalib.validateMessage(msg));
      assert.equal(result.mensaje, `<span style='color:red'>⚠️ La URL proporcionada no es una imagen o video válido: https://malicious-site.com</span>`);
    });

    it('debería bloquear scripts y sanitizar el mensaje', function () {
      const msg = JSON.stringify({
        nombre: 'Ana',
        mensaje: '<script>alert("Hola")</script>',
        color: 'yellow'
      });
      const result = JSON.parse(unalib.validateMessage(msg));
      assert.equal(result.mensaje, '');
    });
  });
});
