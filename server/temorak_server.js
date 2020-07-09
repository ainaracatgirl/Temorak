const fs = require('fs');
const http = require('http');
const ws = require('ws');
const crypto = require('crypto');
const wss = new ws.Server({noServer: true});

const {
    performance
} = require('perf_hooks');

let events = {};

let content = {
    oninit: function(ws) {
        ws.userData = {
            joined: false,
            usernameSet: false,
            username: null,
            operator: false,
            passwordHash: undefined,
            x: 0,
            y: 0
        };
        ws.send('[VERSION] ' + events.onVersionRequest());
    },
    onmessage: function(ws, message) {
        if (message.startsWith('[USER-SET] ')) {
            if (ws.userData.uDataSet) {
                ws.close(3000, "User data updates are only valid when asked for");
            } else {
                if (!clientHasName(message.substr(11))) {
                    ws.userData.username = message.substr(11);
                    ws.userData.uDataSet = true;
    
                    if (validUsername(ws.userData.username)) {
                        if (fs.existsSync("users/" + ws.userData.username + ".dat")) {
                            let data = JSON.parse(fs.readFileSync("users/" + ws.userData.username + ".dat") + '');
                            ws.userData.operator = data.operator;
                            ws.userData.passwordHash = data.passwordHash;
                            ws.userData.x = data.x;
                            ws.userData.y = data.y;
                            ws.send("[AUTH] VALIDATE");
                        } else {
                            ws.send("[AUTH] CREATE");
                        }
                    } else {
                        ws.close(3000, "Username can't be <b>" + ws.userData.username + "</b>");
                    }
                } else {
                    ws.close(3000, "Player <b>" + message.substr(11) + "</b> is already playing on this server.");
                }
            }
        } else if (message.startsWith('[AUTH] ')) {
            if (ws.userData.username == null) {
                ws.close(3000, "Username can't be <b>null</b>");
            } else {
                let pass = hashPassword(message.substr(7));
                if (!ws.userData.passwordHash) {
                    ws.userData.passwordHash = pass;
                    ws.userData.joined = true;
                    save(ws);
                    events.onPlayerJoined(ws);
                } else {
                    if (ws.userData.passwordHash != pass) {
                        ws.close(3001, "Incorrect credentials");
                    } else {
                        ws.userData.joined = true;
                        events.onPlayerJoined(ws);
                    }
                }
            }
        } else if (message.startsWith('[CHAT] ')) {
            if (ws.userData.joined) {
                let chatData = message.substr(7);
                events.onPlayerChat(ws, chatData);
            }
        } else if (message.startsWith('[STATE] ')) {
            events.onPlayerState(ws, message);
        } else {
            console.log(message);
        }
    },
    onerror: function(ws, error) {

    },
    onclose: function(ws, code) {
        if (ws.userData.joined) {
            events.onPlayerLeft(ws);
        }
        clients.remove(ws);
    }
};

let CONTENT_CODE = fs.readFileSync('content.js') + '';
eval(CONTENT_CODE);

let clients = [];

let startMillis = -1;

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function validUsername(username) {
    return username.match(/^[0-9a-zA-Z_-]+$/);
}

function hashPassword(pass) {
    let hash = crypto.createHash('sha512');
    let data = hash.update(pass, 'utf-8');
    let gen_hash = data.digest('hex');
    return gen_hash;
}

function playerNames() {
    let str = "";

    for (let i = 0; i < clients.length; i++) {
        if (clients[i].userData && clients[i].userData.joined) {
            str += clients[i].userData.username + " ";
        }
    }

    return str;
}

function sendAll(message, exclude=null) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].userData && clients[i].userData.joined) {
            if (exclude != clients[i].userData.username) {
                clients[i].send(message);
            }
        }
    }
}

function clientHasName(name) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].userData && clients[i].userData.joined) {
            if (clients[i].userData.username == name) {
                return true;
            }
        }
    }
    return false;
}

function accept(req, res) {
    if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
        res.end();
        return;
    }

    if (!req.headers.connection.match(/\bupgrade\b/i)) {
        res.end();
        return;
    }

    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}

function onConnect(ws) {
    clients.push(ws);
    content.oninit(ws);
    ws.on('message', function (message) {
        content.onmessage(ws, message);
    });
    ws.on('close', function (message) {
        content.onclose(ws, message);
    });
    ws.on('error', function (message) {
        content.onerror(ws, message);
    });
}

function save(ws) {
    fs.writeFileSync("users/" + ws.userData.username + ".dat", JSON.stringify(ws.userData));
}

if (!module.parent) {
    var stdin = process.openStdin();
    let server = undefined;
    let listen = undefined;

    stdin.addListener("data", function(d) {
        if (d.toString().trim() == 'reload') {
            let CONTENT_CODE = fs.readFileSync('content.js') + '';
            eval(CONTENT_CODE);
            clients.forEach(client => {
                client.close(3001, "Auto reconnect");
            });
            console.log('[>] Content reloaded');
        } else if (d.toString().trim().startsWith("op ")) {
            let user = d.toString().trim().substr(3);
            let found = false;
            clients.forEach(ws => {
                if (ws.userData.username == user) {
                    ws.userData.operator = true;
                    ws.send("[CHAT] §e» §bYou gained operator privileges");
                    save(ws);
                    found = true;
                }
            });
            if (found) {
                console.log('[>] User ' + user + ' is now an operator');
            } else {
                console.log('[>] User ' + user + ' is not online');
            }
        } else if (d.toString().trim().startsWith("deop ")) {
            let user = d.toString().trim().substr(5);
            let found = false;
            clients.forEach(ws => {
                if (ws.userData.username == user) {
                    ws.userData.operator = false;
                    ws.send("[CHAT] §e» §bYour operator privileges got removed");
                    save(ws);
                    found = true;
                }
            });
            if (found) {
                console.log('[>] User ' + user + ' is now not an operator');
            } else {
                console.log('[>] User ' + user + ' is not online');
            }
        } else if (d.toString().trim().startsWith("kick ")) {
            let user = d.toString().trim().substr(5);
            let found = false;
            clients.forEach(ws => {
                if (ws.userData.username == user) {
                    save(ws);
                    ws.close(3002, "You got kicked/banned from this server");
                    found = true;
                }
            });
            if (found) {
                console.log('[>] User ' + user + ' has been kicked');
            } else {
                console.log('[>] User ' + user + ' is not online');
            }
        } else if (d.toString().trim().startsWith("Chat ")) {
            sendAll("[CHAT] " + d.toString().trim().substr(5).split("&").join("§"));
        } else if (d.toString().trim() == "stop") {
            clients.forEach(ws => {
                save(ws);
                ws.close(3003, "Server closed/restarting");
            });
            console.log("[>] Data is safe, you can now Ctrl+C out");
        } else if (d.toString().trim() == "uptime") {
            let secs = ((performance.now() - startMillis) / 1000).toPrecision(2);
            let mins = (secs / 60).toPrecision(2);
            let hours = (mins / 60).toPrecision(2);
            let days = (hours / 24).toPrecision(2);

            if (mins < 1) {
                console.log("[>] Server has been up for " + (secs % 60) + "s");
            } else if (hours < 1) {
                console.log("[>] Server has been up for " + (mins % 60) + "min " + (secs % 60) + "s");
            } else if (days < 1) {
                console.log("[>] Server has been up for " + (hours % 60) + "h " + (mins % 60) + "min " + (secs % 60) + "s");
            } else {
                console.log("[>] Server has been up for " + days + " days " + (hours % 60) + "h " + (mins % 60) + "min " + (secs % 60) + "s (a server restart may be required)");
            }
        } else if (d.toString().trim() == "uptime -raw") {
            let secs = ((performance.now() - startMillis) / 1000).toPrecision(2);
            let mins = (secs / 60).toPrecision(2);

            console.log("[>] Server has been up for " + (mins) + "min " + (secs) + "s");
        }
    });
    console.log("[>] Temorak ticker started");
    setInterval(function() {
        events.onServerTick();
    }, 16.666);

    console.log("[>] Temorak server listening on port 8080");
    startMillis = performance.now();
    server = http.createServer(accept);
    listen = server.listen(8080);
} else {
    exports.accept = accept;
}