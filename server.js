const http = require("http");
const express = require("express");

const app = express();

const server = http.createServer(app);

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + "/public"));

// Socket.io setup //

const io = require("socket.io")(server);

var users = {};

io.on("connection", (socket) => {
  socket.on("new-users-joined", (username) => {
    users[socket.id] = username;
    socket.broadcast.emit("users-connected", username);
    io.emit("users-list", users);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("users-disconnected", (user = users[socket.id]));
    delete users[socket.id];
    io.emit("users-list", users);
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("message", {
      user: data.user,
      msg: data.msg,
    });
  });
});

// Socket.io setup //

server.listen(port, () => {
  console.log("server started at " + port);
});
