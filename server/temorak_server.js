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

if (!module.parent) {
    var stdin = process.openStdin();

    stdin.addListener("data", function(d) {
        if (d.toString().trim() == 'Request-Content-Reset') {
            let CONTENT_CODE = fs.readFileSync('content.js') + '';
            eval(CONTENT_CODE);
            clients.forEach(client => {
                client.close(3001, "Auto reconnect");
            });
            console.log('[>] Request-Accpeted');
        }
    });

    console.log("[>] Temorak server listening on port 80");
    http.createServer(accept).listen(8080);
} else {
    exports.accept = accept;
}