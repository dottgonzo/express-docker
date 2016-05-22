import * as IO from "socket.io";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import * as pathExists from "path-exists";
import * as cors from "cors";
import docker = require("dockerlogs");
import merge = require("json-add");
import timerdaemon = require("timerdaemon");


interface Idefaults {
    port: number;
    secret?: string;

}


let ioSocket: any;

let socketioJwt = require("socketio-jwt");


let options: Idefaults = {
    port: 6767,
    secret: new Date().getTime() + "xxx"

}




if (pathExists.sync("./conf.json")) merge(options, require("./conf.json"))







let app = express();
app.all("/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");

    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

if (pathExists.sync("/app") && pathExists.sync("/index.html")) app.use("/", express.static(__dirname + "/app"));


let server = require("http").Server(app);

console.log("listen :" + options.port);



let io = IO(server);
io.use(socketioJwt.authorize({
    secret: options.secret,
    handshake: true

}));

io.on("connection", function(socket) {
    // in socket.io 1.0

console.log("connected")
    socket.on("subscribe", function(room) {
        console.log("joining room", room);
        socket.join(room);
    });







    console.log("hello! ");
});
io.on("disconnection", function(socket) {
    // in socket.io 1.0


    console.log("bye! ");
});
let Docker = new docker();

let streamInspect: any = false;

Docker.stream(function(data) {
    if (data !== streamInspect) {
        streamInspect = data;
        io.sockets.in("inspects").emit("inspects", streamInspect);
    }

})
app.post("/login", function(req, res) {


    let token = jwt.sign({ok:"oki"}, options.secret, { expiresIn: "2 days" });
    res.json({ token: token });


})

app.get("/about", function(req, res) {



    res.json(Docker);


})


app.get("/data", function(req, res) {

    if (streamInspect) {
        res.json(streamInspect);
    } else {
        Docker.data().then(function(data) {
            res.json(data);
        }).catch(function(err) {
            res.json(err);
        })

    }




})
server.listen(options.port);