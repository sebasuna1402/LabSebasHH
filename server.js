require('dotenv').config();
const express = require('express');
const http = require('http');
const session = require("express-session");
const { auth, requiresAuth } = require('express-openid-connect');
const socketio = require('socket.io');
const path = require('path');

// Importar la biblioteca de validación `unaLib`
const unaLib = require('./unalib/index.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

// Configuración de Auth0
const config = {
  authRequired: true,
  auth0Logout: true, // Habilita Auth0 para manejar el cierre de sesión
  secret: process.env.AUTH0_SECRET ,
  baseURL:  process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID ,
  issuerBaseURL:  process.env.AUTH0_ISSUER_BASE_URL
};

// Implementación de Auth0
app.use(auth(config));

// Rutas de la aplicación
app.get('/', requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Ruta del chat protegida
app.get('/chat', requiresAuth(), (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Ruta del dashboard protegida
app.get('/dashboard', requiresAuth(), (req, res) => {
  res.send(`
    <h1>Bienvenido, ${req.oidc.user.name}!</h1>
    <p>Su email es: ${req.oidc.user.email}</p>
    <p><a href="/chat">Ir al chat</a> | <a href="/logout">Cerrar sesión</a></p>
  `);
});

// Ruta para obtener la información del usuario
app.get('/userinfo', requiresAuth(), (req, res) => {
  res.json({
    nombre: req.oidc.user.name || 'Usuario Anónimo',
    email: req.oidc.user.email
  });
});

// Agregar la ruta para cerrar sesión
app.get('/logout', (req, res) => {
  res.oidc.logout({ returnTo: 'http://localhost:3000' });
});

// Configuración de Socket.io para el chat
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado.');

  // Validar el mensaje antes de reenviarlo
  socket.on('Evento-Mensaje-Server', (msg) => {
    // Usar `unaLib.validateMessage` para convertir URLs en contenido multimedia
    const mensajeValidado = unaLib.validateMessage(msg);
    io.emit('Evento-Mensaje-Server', mensajeValidado);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

// Servir archivos estáticos (CSS, JS)
app.use("/static", express.static("static"));

// Iniciar el servidor en el puerto definido
server.listen(port, () => {
  console.log('Listening on *:' + port);
});
