function save(ws) {
    fs.writeFileSync("users/" + ws.userData.username + ".dat", JSON.stringify(ws.userData));
}

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

function sendAll(message, exclude=null) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].userData && clients[i].userData.joined) {
            if (exclude != clients[i].userData.username) {
                clients[i].send(message);
            }
        }
    }
}

content = {
    oninit: function(ws) {
        ws.userData = {
            joined: false,
            usernameSet: false,
            username: null,
            operator: false,
            passwordHash: undefined
        };
        ws.send('[VERSION] TDR-1 PTDR-1');
    },
    onmessage: function(ws, message) {
        if (message.startsWith('[USER-SET] ')) {
            if (ws.userData.uDataSet) {
                ws.close(3000, "User data updates are only valid when asked for");
            } else {
                ws.userData.username = message.substr(11);
                ws.userData.uDataSet = true;

                if (validUsername(ws.userData.username)) {
                    if (fs.existsSync("users/" + ws.userData.username + ".dat")) {
                        let data = JSON.parse(fs.readFileSync("users/" + ws.userData.username + ".dat") + '');
                        ws.userData.operator = data.operator;
                        ws.userData.passwordHash = data.passwordHash;
                        ws.send("[AUTH] VALIDATE");
                    } else {
                        ws.send("[AUTH] CREATE");
                    }
                } else {
                    ws.close(3000, "Username can't be <b>" + ws.userData.username + "</b>");
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
                    ws.send("[AUTH-OK]");
                    sendAll("[USER-JOINED] " + ws.userData.username);
                    console.log("[USER-JOINED]", ws.userData);
                } else {
                    if (ws.userData.passwordHash != pass) {
                        ws.close(3001, "Incorrect credentials");
                    } else {
                        ws.userData.joined = true;
                        ws.send("[AUTH-OK]");
                        sendAll("[USER-JOINED] " + ws.userData.username);
                        console.log("[USER-JOINED]", ws.userData);
                    }
                }
            }
        } else {
            console.log(message);
        }
    },
    onerror: function(ws, error) {

    },
    onclose: function(ws, code) {
        if (ws.userData.joined) {
            sendAll("[USER-LEFT] " + ws.userData.username);
            console.log("[USER-LEFT]", ws.userData)
        }
        clients.remove(ws);
    }
};