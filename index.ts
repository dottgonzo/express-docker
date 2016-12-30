import * as IO from "socket.io";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import * as pathExists from "path-exists";
import * as cors from "cors";
import docker = require("dockerlogs");
import merge = require("json-add");
import timerdaemon = require("timerdaemon");

import * as http from "http";

const socketioJwt = require("socketio-jwt");

interface Idefaults {
    port: number;
    secret: string;
    password: string;
}



const app = express();


let ioSocket: any;



let options: Idefaults = {
    port: 6767,
    secret: new Date().getTime() + "xxx",
    password: 'admindocker'
}




if (pathExists.sync("./conf.json")) merge(options, require("./conf.json"))







app.all("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");

    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

if (pathExists.sync("/app") && pathExists.sync("/index.html")) app.use("/", express.static(__dirname + "/app"));


const server = http.createServer(app);
const io = IO(server);

console.log("listen :" + options.port);


io.on('connection', socketioJwt.authorize({
    secret: options.secret,
    timeout: 15000 // 15 seconds to send the authentication message
})).on('authenticated', function (socket) {
    socket.join('user');
    console.log('new user')
    socket.on("subscribe", function (room) {
        console.log("joining room", room);
        socket.join(room);
    });
});

io.on("disconnection", function (socket) {
    // in socket.io 1.0


    console.log("bye! ");
});

let Docker = new docker();

let streamInspect: any = false;

Docker.stream(function (data) {
    if (data !== streamInspect) {
        streamInspect = data;
        io.sockets.in("inspects").emit("inspects", streamInspect);
    }

})
app.post("/signin", function (req, res) {

    console.log('signin')
    if (req.body && req.body.pass && req.body.pass === options.password) {
        console.log('token')
        const token = jwt.sign({ ok: "oki" }, options.secret, { expiresIn: "2 days" });
        console.log(token)

        res.json({ token: token });
    } else {
        res.json({ error: 'wrong auth' });
    }

})

app.get("/about", function (req, res) {
    res.json(Docker);
})


app.get("/data", function (req, res) {

    if (streamInspect) {
        res.json(streamInspect);
    } else {
        Docker.data().then(function (data) {
            res.json(data);
        }).catch(function (err) {
            res.json(err);
        })

    }




})
server.listen(options.port);