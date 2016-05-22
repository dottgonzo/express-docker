"use strict";
var IO = require("socket.io");
var express = require("express");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var pathExists = require("path-exists");
var cors = require("cors");
var docker = require("dockerlogs");
var merge = require("json-add");
var ioSocket;
var socketioJwt = require("socketio-jwt");
var options = {
    port: 6767,
    secret: new Date().getTime() + "xxx"
};
var secret;
if (!pathExists.sync(__dirname + "./conf.json"))
    merge(options, require("./conf.json"));
var app = express();
app.all("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
if (pathExists.sync("/app") && pathExists.sync("/index.html"))
    app.use("/", express.static(__dirname + "/app"));
var server = require("http").Server(app);
console.log("listen :" + options.port);
var io = IO(server);
io.use(socketioJwt.authorize({
    secret: secret,
    handshake: true
}));
io.on("connection", function (socket) {
    socket.on("subscribe", function (room) {
        console.log("joining room", room);
        socket.join(room);
    });
    console.log("hello! ");
});
io.on("disconnection", function (socket) {
    console.log("bye! ");
});
var Docker = new docker();
Docker.stream(function (data) {
    io.sockets.in("inspects").emit("inspects", data);
});
app.post("/login", function (req, res) {
    var token = jwt.sign("oki", secret, { expiresIn: "2days" });
    res.json({ token: token });
});
app.get("/about", function (req, res) {
    res.json(Docker);
});
app.get("/data", function (req, res) {
    Docker.data().then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.json(err);
    });
});
server.listen(options.port);

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgSU8gZnJvbSBcInNvY2tldC5pb1wiO1xuaW1wb3J0ICogYXMgZXhwcmVzcyBmcm9tIFwiZXhwcmVzc1wiO1xuaW1wb3J0ICogYXMgYm9keVBhcnNlciBmcm9tIFwiYm9keS1wYXJzZXJcIjtcbmltcG9ydCAqIGFzIGp3dCBmcm9tIFwianNvbndlYnRva2VuXCI7XG5pbXBvcnQgKiBhcyBwYXRoRXhpc3RzIGZyb20gXCJwYXRoLWV4aXN0c1wiO1xuaW1wb3J0ICogYXMgY29ycyBmcm9tIFwiY29yc1wiO1xuaW1wb3J0IGRvY2tlciA9IHJlcXVpcmUoXCJkb2NrZXJsb2dzXCIpO1xuaW1wb3J0IG1lcmdlID0gcmVxdWlyZShcImpzb24tYWRkXCIpO1xuaW1wb3J0IHRpbWVyZGFlbW9uID0gcmVxdWlyZShcInRpbWVyZGFlbW9uXCIpO1xuXG5cbmludGVyZmFjZSBJZGVmYXVsdHMge1xuICAgIHBvcnQ6IG51bWJlcjtcbiAgICBzZWNyZXQ/OiBzdHJpbmc7XG5cbn1cblxuXG5sZXQgaW9Tb2NrZXQ6IGFueTtcblxubGV0IHNvY2tldGlvSnd0ID0gcmVxdWlyZShcInNvY2tldGlvLWp3dFwiKTtcblxuXG5sZXQgb3B0aW9uczogSWRlZmF1bHRzID0ge1xuICAgIHBvcnQ6IDY3NjcsXG4gICAgc2VjcmV0OiBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIFwieHh4XCJcblxufVxubGV0IHNlY3JldDogc3RyaW5nO1xuXG5cbmlmICghcGF0aEV4aXN0cy5zeW5jKF9fZGlybmFtZStcIi4vY29uZi5qc29uXCIpKSBtZXJnZShvcHRpb25zLCByZXF1aXJlKFwiLi9jb25mLmpzb25cIikpXG5cblxuXG5cblxuXG5cbmxldCBhcHAgPSBleHByZXNzKCk7XG5hcHAuYWxsKFwiLypcIiwgZnVuY3Rpb24ocmVxLCByZXMsIG5leHQpIHtcbiAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcblxuICAgIG5leHQoKTtcbn0pO1xuXG4vLyBwYXJzZSBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcbmFwcC51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IGZhbHNlIH0pKTtcblxuLy8gcGFyc2UgYXBwbGljYXRpb24vanNvblxuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oKSk7XG5cbmFwcC51c2UoY29ycygpKTtcblxuaWYgKHBhdGhFeGlzdHMuc3luYyhcIi9hcHBcIikgJiYgcGF0aEV4aXN0cy5zeW5jKFwiL2luZGV4Lmh0bWxcIikpIGFwcC51c2UoXCIvXCIsIGV4cHJlc3Muc3RhdGljKF9fZGlybmFtZSArIFwiL2FwcFwiKSk7XG5cblxubGV0IHNlcnZlciA9IHJlcXVpcmUoXCJodHRwXCIpLlNlcnZlcihhcHApO1xuXG5jb25zb2xlLmxvZyhcImxpc3RlbiA6XCIgKyBvcHRpb25zLnBvcnQpO1xuXG5cblxubGV0IGlvID0gSU8oc2VydmVyKTtcbmlvLnVzZShzb2NrZXRpb0p3dC5hdXRob3JpemUoe1xuICAgIHNlY3JldDogc2VjcmV0LFxuICAgIGhhbmRzaGFrZTogdHJ1ZVxuXG59KSk7XG5cbmlvLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAvLyBpbiBzb2NrZXQuaW8gMS4wXG5cblxuICAgIHNvY2tldC5vbihcInN1YnNjcmliZVwiLCBmdW5jdGlvbihyb29tKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiam9pbmluZyByb29tXCIsIHJvb20pO1xuICAgICAgICBzb2NrZXQuam9pbihyb29tKTtcbiAgICB9KTtcblxuXG5cblxuXG5cblxuICAgIGNvbnNvbGUubG9nKFwiaGVsbG8hIFwiKTtcbn0pO1xuaW8ub24oXCJkaXNjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKHNvY2tldCkge1xuICAgIC8vIGluIHNvY2tldC5pbyAxLjBcblxuXG4gICAgY29uc29sZS5sb2coXCJieWUhIFwiKTtcbn0pO1xubGV0IERvY2tlciA9IG5ldyBkb2NrZXIoKTtcbkRvY2tlci5zdHJlYW0oZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgaW8uc29ja2V0cy5pbihcImluc3BlY3RzXCIpLmVtaXQoXCJpbnNwZWN0c1wiLCBkYXRhKTtcblxufSlcbmFwcC5wb3N0KFwiL2xvZ2luXCIsIGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG5cblxuICAgIGxldCB0b2tlbiA9IGp3dC5zaWduKFwib2tpXCIsIHNlY3JldCwgeyBleHBpcmVzSW46IFwiMmRheXNcIiB9KTtcbiAgICByZXMuanNvbih7IHRva2VuOiB0b2tlbiB9KTtcblxuXG59KVxuXG5hcHAuZ2V0KFwiL2Fib3V0XCIsIGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG5cblxuXG4gICAgcmVzLmpzb24oRG9ja2VyKTtcblxuXG59KVxuXG5cbmFwcC5nZXQoXCIvZGF0YVwiLCBmdW5jdGlvbihyZXEsIHJlcykge1xuXG5cbiAgICBEb2NrZXIuZGF0YSgpLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHJlcy5qc29uKGRhdGEpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIHJlcy5qc29uKGVycik7XG4gICAgICAgIH0pXG5cblxuXG59KVxuc2VydmVyLmxpc3RlbihvcHRpb25zLnBvcnQpOyJdfQ==
