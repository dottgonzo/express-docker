"use strict";
var IO = require("socket.io");
var express = require("express");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var pathExists = require("path-exists");
var cors = require("cors");
var docker = require("dockerlogs");
var merge = require("json-add");
var http = require("http");
var socketioJwt = require("socketio-jwt");
var app = express();
var ioSocket;
var options = {
    port: 6767,
    secret: new Date().getTime() + "xxx",
    password: 'admindocker'
};
if (pathExists.sync("./conf.json"))
    merge(options, require("./conf.json"));
app.all("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
if (pathExists.sync("/app") && pathExists.sync("/index.html"))
    app.use("/", express.static(__dirname + "/app"));
var server = http.createServer(app);
var io = IO(server);
console.log("listen :" + options.port);
io.on('connection', socketioJwt.authorize({
    secret: options.secret,
    timeout: 15000
})).on('authenticated', function (socket) {
    socket.join('inspects');
    console.log('new user');
    socket.on("subscribe", function (room) {
        console.log("joining room", room);
        socket.join(room);
    });
});
io.on("disconnection", function (socket) {
    console.log("bye! ");
});
var Docker = new docker();
var streamInspect = false;
Docker.stream(function (data) {
    if (data !== streamInspect) {
        streamInspect = data;
        io.sockets.in("inspects").emit("inspects", streamInspect);
    }
});
app.post("/signin", function (req, res) {
    if (req.body && req.body.pass && req.body.pass === options.password) {
        var token = jwt.sign({ ok: "oki" }, options.secret, { expiresIn: "2 days" });
        console.log('signined');
        res.json({ token: token });
    }
    else {
        res.json({ error: 'wrong auth' });
        console.log('unauthorized');
    }
});
app.get("/about", function (req, res) {
    res.json(Docker);
});
app.get("/data", function (req, res) {
    if (streamInspect) {
        res.json(streamInspect);
    }
    else {
        Docker.data().then(function (data) {
            res.json(data);
        }).catch(function (err) {
            res.json(err);
        });
    }
});
server.listen(options.port);

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQTtBQUdGLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsR0FBRyxFQUFFLEdBQUc7SUFFL0IsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNoQixHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNKLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJO1lBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRztZQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFBO0lBRU4sQ0FBQztBQUtMLENBQUMsQ0FBQyxDQUFBO0FBQ0YsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBJTyBmcm9tIFwic29ja2V0LmlvXCI7XG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gXCJleHByZXNzXCI7XG5pbXBvcnQgKiBhcyBib2R5UGFyc2VyIGZyb20gXCJib2R5LXBhcnNlclwiO1xuaW1wb3J0ICogYXMgand0IGZyb20gXCJqc29ud2VidG9rZW5cIjtcbmltcG9ydCAqIGFzIHBhdGhFeGlzdHMgZnJvbSBcInBhdGgtZXhpc3RzXCI7XG5pbXBvcnQgKiBhcyBjb3JzIGZyb20gXCJjb3JzXCI7XG5pbXBvcnQgZG9ja2VyID0gcmVxdWlyZShcImRvY2tlcmxvZ3NcIik7XG5pbXBvcnQgbWVyZ2UgPSByZXF1aXJlKFwianNvbi1hZGRcIik7XG5pbXBvcnQgdGltZXJkYWVtb24gPSByZXF1aXJlKFwidGltZXJkYWVtb25cIik7XG5cbmltcG9ydCAqIGFzIGh0dHAgZnJvbSBcImh0dHBcIjtcblxuY29uc3Qgc29ja2V0aW9Kd3QgPSByZXF1aXJlKFwic29ja2V0aW8tand0XCIpO1xuXG5pbnRlcmZhY2UgSWRlZmF1bHRzIHtcbiAgICBwb3J0OiBudW1iZXI7XG4gICAgc2VjcmV0OiBzdHJpbmc7XG4gICAgcGFzc3dvcmQ6IHN0cmluZztcbn1cblxuXG5cbmNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcblxuXG5sZXQgaW9Tb2NrZXQ6IGFueTtcblxuXG5cbmNvbnN0IG9wdGlvbnM6IElkZWZhdWx0cyA9IHtcbiAgICBwb3J0OiA2NzY3LFxuICAgIHNlY3JldDogbmV3IERhdGUoKS5nZXRUaW1lKCkgKyBcInh4eFwiLFxuICAgIHBhc3N3b3JkOiAnYWRtaW5kb2NrZXInXG59XG5cblxuXG5cbmlmIChwYXRoRXhpc3RzLnN5bmMoXCIuL2NvbmYuanNvblwiKSkgbWVyZ2Uob3B0aW9ucywgcmVxdWlyZShcIi4vY29uZi5qc29uXCIpKVxuXG5cbmFwcC5hbGwoXCIvKlwiLCBmdW5jdGlvbiAocmVxLCByZXMsIG5leHQpIHtcbiAgICByZXMuaGVhZGVyKFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIFwiKlwiKTtcblxuICAgIG5leHQoKTtcbn0pO1xuXG4vLyBwYXJzZSBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcbmFwcC51c2UoYm9keVBhcnNlci51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IGZhbHNlIH0pKTtcblxuLy8gcGFyc2UgYXBwbGljYXRpb24vanNvblxuYXBwLnVzZShib2R5UGFyc2VyLmpzb24oKSk7XG5cbmFwcC51c2UoY29ycygpKTtcblxuaWYgKHBhdGhFeGlzdHMuc3luYyhcIi9hcHBcIikgJiYgcGF0aEV4aXN0cy5zeW5jKFwiL2luZGV4Lmh0bWxcIikpIGFwcC51c2UoXCIvXCIsIGV4cHJlc3Muc3RhdGljKF9fZGlybmFtZSArIFwiL2FwcFwiKSk7XG5cblxuY29uc3Qgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXBwKTtcbmNvbnN0IGlvID0gSU8oc2VydmVyKTtcblxuY29uc29sZS5sb2coXCJsaXN0ZW4gOlwiICsgb3B0aW9ucy5wb3J0KTtcblxuXG5pby5vbignY29ubmVjdGlvbicsIHNvY2tldGlvSnd0LmF1dGhvcml6ZSh7XG4gICAgc2VjcmV0OiBvcHRpb25zLnNlY3JldCxcbiAgICB0aW1lb3V0OiAxNTAwMCAvLyAxNSBzZWNvbmRzIHRvIHNlbmQgdGhlIGF1dGhlbnRpY2F0aW9uIG1lc3NhZ2Vcbn0pKS5vbignYXV0aGVudGljYXRlZCcsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICBzb2NrZXQuam9pbignaW5zcGVjdHMnKTtcbiAgICBjb25zb2xlLmxvZygnbmV3IHVzZXInKVxuICAgIHNvY2tldC5vbihcInN1YnNjcmliZVwiLCBmdW5jdGlvbiAocm9vbSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImpvaW5pbmcgcm9vbVwiLCByb29tKTtcbiAgICAgICAgc29ja2V0LmpvaW4ocm9vbSk7XG4gICAgfSk7XG59KTtcblxuaW8ub24oXCJkaXNjb25uZWN0aW9uXCIsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAvLyBpbiBzb2NrZXQuaW8gMS4wXG4gICAgY29uc29sZS5sb2coXCJieWUhIFwiKTtcbn0pO1xuXG5sZXQgRG9ja2VyID0gbmV3IGRvY2tlcigpO1xuXG5sZXQgc3RyZWFtSW5zcGVjdDogYW55ID0gZmFsc2U7XG5cbkRvY2tlci5zdHJlYW0oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAoZGF0YSAhPT0gc3RyZWFtSW5zcGVjdCkge1xuICAgICAgICBzdHJlYW1JbnNwZWN0ID0gZGF0YTtcbiAgICAgICAgaW8uc29ja2V0cy5pbihcImluc3BlY3RzXCIpLmVtaXQoXCJpbnNwZWN0c1wiLCBzdHJlYW1JbnNwZWN0KTtcbiAgICB9XG5cbn0pXG5hcHAucG9zdChcIi9zaWduaW5cIiwgZnVuY3Rpb24gKHJlcSwgcmVzKSB7XG5cbiAgICBpZiAocmVxLmJvZHkgJiYgcmVxLmJvZHkucGFzcyAmJiByZXEuYm9keS5wYXNzID09PSBvcHRpb25zLnBhc3N3b3JkKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gand0LnNpZ24oeyBvazogXCJva2lcIiB9LCBvcHRpb25zLnNlY3JldCwgeyBleHBpcmVzSW46IFwiMiBkYXlzXCIgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzaWduaW5lZCcpXG4gICAgICAgIHJlcy5qc29uKHsgdG9rZW46IHRva2VuIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5qc29uKHsgZXJyb3I6ICd3cm9uZyBhdXRoJyB9KTtcbiAgICAgICAgY29uc29sZS5sb2coJ3VuYXV0aG9yaXplZCcpXG4gICAgfVxuXG59KVxuXG5hcHAuZ2V0KFwiL2Fib3V0XCIsIGZ1bmN0aW9uIChyZXEsIHJlcykge1xuICAgIHJlcy5qc29uKERvY2tlcik7XG59KVxuXG5cbmFwcC5nZXQoXCIvZGF0YVwiLCBmdW5jdGlvbiAocmVxLCByZXMpIHtcblxuICAgIGlmIChzdHJlYW1JbnNwZWN0KSB7XG4gICAgICAgIHJlcy5qc29uKHN0cmVhbUluc3BlY3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIERvY2tlci5kYXRhKCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmVzLmpzb24oZGF0YSk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHJlcy5qc29uKGVycik7XG4gICAgICAgIH0pXG5cbiAgICB9XG5cblxuXG5cbn0pXG5zZXJ2ZXIubGlzdGVuKG9wdGlvbnMucG9ydCk7Il19
