const fs = require('fs');
const http = require('http');
const ws = require('ws');
const crypto = require('crypto');
const wss = new ws.Server({noServer: true});

let content = {};

let CONTENT_CODE = fs.readFileSync('content.js') + '';
eval(CONTENT_CODE);

let clients = [];

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
        if (d.toString().trim() == 'Request-Content-Reset') {
            let CONTENT_CODE = fs.readFileSync('content.js') + '';
            eval(CONTENT_CODE);
            clients.forEach(client => {
                client.close(3001, "Auto reconnect");
            });
            console.log('[>] Request-Accpeted');
        } else if (d.toString().trim().startsWith("Set-Operator ")) {
            let user = d.toString().trim().substr(13);
            let found = false;
            clients.forEach(ws => {
                if (ws.userData.username == user) {
                    ws.userData.operator = true;
                    ws.send("[CHAT] [>] Your gained operator privileges");
                    save(ws);
                    found = true;
                }
            });
            if (found) {
                console.log('[>] User ' + user + ' is now an operator');
            } else {
                console.log('[>] User ' + user + ' is not online');
            }
        } else if (d.toString().trim().startsWith("Unset-Operator ")) {
            let user = d.toString().trim().substr(15);
            let found = false;
            clients.forEach(ws => {
                if (ws.userData.username == user) {
                    ws.userData.operator = false;
                    ws.send("[CHAT] [>] Your operator privileges got removed");
                    save(ws);
                    found = true;
                }
            });
            if (found) {
                console.log('[>] User ' + user + ' is now not an operator');
            } else {
                console.log('[>] User ' + user + ' is not online');
            }
        } else if (d.toString().trim() == "Stop") {
            clients.forEach(ws => {
                save(ws);
            });
            console.log("Data is safe, Ctrl+C");
        }
    });

    console.log("[>] Temorak server listening on port 8080");
    server = http.createServer(accept);
    listen = server.listen(8080);
} else {
    exports.accept = accept;
}