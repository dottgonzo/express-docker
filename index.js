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
if (pathExists.sync("./conf.json"))
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
var streamInspect = false;
Docker.stream(function (data) {
    if (data !== streamInspect) {
        streamInspect = data;
        io.sockets.in("inspects").emit("inspects", streamInspect);
    }
});
app.post("/login", function (req, res) {
    var token = jwt.sign("oki", secret, { expiresIn: "2 days" });
    res.json({ token: token });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFTLElBQUk7WUFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBUyxHQUFHO1lBQ2pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUE7SUFFTixDQUFDO0FBS0wsQ0FBQyxDQUFDLENBQUE7QUFDRixNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIElPIGZyb20gXCJzb2NrZXQuaW9cIjtcbmltcG9ydCAqIGFzIGV4cHJlc3MgZnJvbSBcImV4cHJlc3NcIjtcbmltcG9ydCAqIGFzIGJvZHlQYXJzZXIgZnJvbSBcImJvZHktcGFyc2VyXCI7XG5pbXBvcnQgKiBhcyBqd3QgZnJvbSBcImpzb253ZWJ0b2tlblwiO1xuaW1wb3J0ICogYXMgcGF0aEV4aXN0cyBmcm9tIFwicGF0aC1leGlzdHNcIjtcbmltcG9ydCAqIGFzIGNvcnMgZnJvbSBcImNvcnNcIjtcbmltcG9ydCBkb2NrZXIgPSByZXF1aXJlKFwiZG9ja2VybG9nc1wiKTtcbmltcG9ydCBtZXJnZSA9IHJlcXVpcmUoXCJqc29uLWFkZFwiKTtcbmltcG9ydCB0aW1lcmRhZW1vbiA9IHJlcXVpcmUoXCJ0aW1lcmRhZW1vblwiKTtcblxuXG5pbnRlcmZhY2UgSWRlZmF1bHRzIHtcbiAgICBwb3J0OiBudW1iZXI7XG4gICAgc2VjcmV0Pzogc3RyaW5nO1xuXG59XG5cblxubGV0IGlvU29ja2V0OiBhbnk7XG5cbmxldCBzb2NrZXRpb0p3dCA9IHJlcXVpcmUoXCJzb2NrZXRpby1qd3RcIik7XG5cblxubGV0IG9wdGlvbnM6IElkZWZhdWx0cyA9IHtcbiAgICBwb3J0OiA2NzY3LFxuICAgIHNlY3JldDogbmV3IERhdGUoKS5nZXRUaW1lKCkgKyBcInh4eFwiXG5cbn1cbmxldCBzZWNyZXQ6IHN0cmluZztcblxuXG5pZiAocGF0aEV4aXN0cy5zeW5jKFwiLi9jb25mLmpzb25cIikpIG1lcmdlKG9wdGlvbnMsIHJlcXVpcmUoXCIuL2NvbmYuanNvblwiKSlcblxuXG5cblxuXG5cblxubGV0IGFwcCA9IGV4cHJlc3MoKTtcbmFwcC5hbGwoXCIvKlwiLCBmdW5jdGlvbihyZXEsIHJlcywgbmV4dCkge1xuICAgIHJlcy5oZWFkZXIoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiwgXCIqXCIpO1xuXG4gICAgbmV4dCgpO1xufSk7XG5cbi8vIHBhcnNlIGFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFxuYXBwLnVzZShib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogZmFsc2UgfSkpO1xuXG4vLyBwYXJzZSBhcHBsaWNhdGlvbi9qc29uXG5hcHAudXNlKGJvZHlQYXJzZXIuanNvbigpKTtcblxuYXBwLnVzZShjb3JzKCkpO1xuXG5pZiAocGF0aEV4aXN0cy5zeW5jKFwiL2FwcFwiKSAmJiBwYXRoRXhpc3RzLnN5bmMoXCIvaW5kZXguaHRtbFwiKSkgYXBwLnVzZShcIi9cIiwgZXhwcmVzcy5zdGF0aWMoX19kaXJuYW1lICsgXCIvYXBwXCIpKTtcblxuXG5sZXQgc2VydmVyID0gcmVxdWlyZShcImh0dHBcIikuU2VydmVyKGFwcCk7XG5cbmNvbnNvbGUubG9nKFwibGlzdGVuIDpcIiArIG9wdGlvbnMucG9ydCk7XG5cblxuXG5sZXQgaW8gPSBJTyhzZXJ2ZXIpO1xuaW8udXNlKHNvY2tldGlvSnd0LmF1dGhvcml6ZSh7XG4gICAgc2VjcmV0OiBzZWNyZXQsXG4gICAgaGFuZHNoYWtlOiB0cnVlXG5cbn0pKTtcblxuaW8ub24oXCJjb25uZWN0aW9uXCIsIGZ1bmN0aW9uKHNvY2tldCkge1xuICAgIC8vIGluIHNvY2tldC5pbyAxLjBcblxuXG4gICAgc29ja2V0Lm9uKFwic3Vic2NyaWJlXCIsIGZ1bmN0aW9uKHJvb20pIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJqb2luaW5nIHJvb21cIiwgcm9vbSk7XG4gICAgICAgIHNvY2tldC5qb2luKHJvb20pO1xuICAgIH0pO1xuXG5cblxuXG5cblxuXG4gICAgY29uc29sZS5sb2coXCJoZWxsbyEgXCIpO1xufSk7XG5pby5vbihcImRpc2Nvbm5lY3Rpb25cIiwgZnVuY3Rpb24oc29ja2V0KSB7XG4gICAgLy8gaW4gc29ja2V0LmlvIDEuMFxuXG5cbiAgICBjb25zb2xlLmxvZyhcImJ5ZSEgXCIpO1xufSk7XG5sZXQgRG9ja2VyID0gbmV3IGRvY2tlcigpO1xuXG5sZXQgc3RyZWFtSW5zcGVjdDogYW55ID0gZmFsc2U7XG5cbkRvY2tlci5zdHJlYW0oZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhICE9PSBzdHJlYW1JbnNwZWN0KSB7XG4gICAgICAgIHN0cmVhbUluc3BlY3QgPSBkYXRhO1xuICAgICAgICBpby5zb2NrZXRzLmluKFwiaW5zcGVjdHNcIikuZW1pdChcImluc3BlY3RzXCIsIHN0cmVhbUluc3BlY3QpO1xuICAgIH1cblxufSlcbmFwcC5wb3N0KFwiL2xvZ2luXCIsIGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG5cblxuICAgIGxldCB0b2tlbiA9IGp3dC5zaWduKFwib2tpXCIsIHNlY3JldCwgeyBleHBpcmVzSW46IFwiMiBkYXlzXCIgfSk7XG4gICAgcmVzLmpzb24oeyB0b2tlbjogdG9rZW4gfSk7XG5cblxufSlcblxuYXBwLmdldChcIi9hYm91dFwiLCBmdW5jdGlvbihyZXEsIHJlcykge1xuXG5cblxuICAgIHJlcy5qc29uKERvY2tlcik7XG5cblxufSlcblxuXG5hcHAuZ2V0KFwiL2RhdGFcIiwgZnVuY3Rpb24ocmVxLCByZXMpIHtcblxuICAgIGlmIChzdHJlYW1JbnNwZWN0KSB7XG4gICAgICAgIHJlcy5qc29uKHN0cmVhbUluc3BlY3QpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIERvY2tlci5kYXRhKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICByZXMuanNvbihkYXRhKTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICByZXMuanNvbihlcnIpO1xuICAgICAgICB9KVxuXG4gICAgfVxuXG5cblxuXG59KVxuc2VydmVyLmxpc3RlbihvcHRpb25zLnBvcnQpOyJdfQ==
