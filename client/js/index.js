// Sooooo... this is the main index.js file, thanks for looking at my messy code. -Jan

console._log = console.log;
console._error = console.error;
console._warn = console.warn;
console.log = function(params) {
    console._log("[INFO]", params);
};
console.error = function(params) {
    console._error("[ERROR]", params);
};
console.warn = function(params) {
    console._warn("[WARN]", params);
};
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
String.prototype.replaceAll = function(search, replace='') {
    return this.split(search).join(replace);
};
String.prototype.contains = function(search) {
    return this.indexOf(search) != -1;
};

/**
 * Linear interpolation algorithm
 * 
 * @param {Number} a 
 * @param {Number} b 
 * @param {Number} k 
 */
function lerp(a, b, k) {
    return (a * (1.0 - k)) + (b * k);
}

function replaceWithFormatting(element) {
    element.innerHTML = element.innerHTML.replace('&lt;b&gt;', '<b>').replace('&lt;/b&gt;', '</b>');
}

function formatColors(txt) {
    return txt.replaceAll("<", "lt;").replaceAll(">", "gt;").replaceAll("§a", "<span style=\"color: green;\">").replaceAll("§b", "<span style=\"color: aqua;\">").replaceAll("§c", "<span style=\"color: red;\">").replaceAll("§d", "<span style=\"color: purple;\">").replaceAll("§e", "<span style=\"color: yellow;\">").replaceAll("§f", "<span style=\"color: white;\">");
}

{ // MODALS
    function modal(id) {
        let struct = {
            dom: document.getElementById(id),
            show: function() {
                this.dom.style.display = "block";
            },
            hide: function() {
                this.dom.style.display = "none";
            },
            setButton: function(id) {
                document.getElementById(id).onclick = this.show;
            }
        };
        return struct;
    }
}

document.getElementById('modalInputUsername').onkeypress = function(e) {
    if (e.key == "Enter") {
        communication.usernameInput();
    }
};
document.getElementById('modalInputPassword0').onkeypress = function(e) {
    if (e.key == "Enter") {
        communication.passwordInput();
    }
};
document.getElementById('modalInputPassword1').onkeypress = function(e) {
    if (e.key == "Enter") {
        document.getElementById('modalInputPassword2').select();
    }
};
document.getElementById('modalInputPassword2').onkeypress = function(e) {
    if (e.key == "Enter") {
        communication.createPasswordInput();
    }
};

let communication = {
    TDR: "TDR-1 PTDR-3",
    onlineUsers: [],
    localUsername: null,
    resendState: false,
    socket: null,
    lastHost: null,
    lastPort: null,
    ignoreServerVersion: false,
    connect: function(host, port=80) {
        this.reset();

        this.socket = new WebSocket("ws://" + host + ":" + port);
        this.socket.onopen = this.oninit;
        this.socket.onmessage = this.onmessage;
        this.socket.onerror = this.onerror;
        this.socket.onclose = this.onclose;
        this.lastHost = host;
        this.lastPort = port;
    },
    reset: function() {
        this.localUsername = null;
        document.getElementById('modalInputUsername').value = "";
        document.getElementById('modalInputUsername').disabled = false;
        document.getElementById('userSendBtn').disabled = false;
        document.getElementById('modalInputPassword0').value = "";
        document.getElementById('modalInputPassword1').value = "";
        document.getElementById('modalInputPassword2').value = "";
        document.getElementById('modalInputCreate').hidden = true;
        document.getElementById('modalInputPassword').hidden = true;
    },
    reconnect: function() {
        this.connect(this.lastHost, this.lastPort);
    },
    usernameInput: function() {
        let username = document.getElementById('modalInputUsername').value.trim();
        if (username == "") {
            document.getElementById('modalInputUsername').value = "";
        } else {
            document.getElementById('modalInputUsername').disabled = true;
            document.getElementById('userSendBtn').disabled = true;
            this.localUsername = username;
            this.socket.send("[USER-SET] " + username);
        }
    },
    passwordInput: function() {
        let pass = document.getElementById('modalInputPassword0').value;
        if (pass.trim() == "") {
            document.getElementById('modalInputPassword0').value = "";
        } else {
            document.getElementById('modalInputPassword0').value = "";
            this.socket.send("[AUTH] " + pass);
            modal('modalInputUser').hide();
        }
    },
    removeUser: function(username) {
        for (let i = 0; i < communication.onlineUsers.length; i++) {
            if (communication.onlineUsers[i].username == username) {
                communication.onlineUsers.splice(i, 1);
                return;
            }
        }
    },
    hasUsername: function(username) {
        for (let i = 0; i < communication.onlineUsers.length; i++) {
            if (communication.onlineUsers[i].username == username) {
                return true;
            }
        }

        return false;
    },
    playersFromAuth: function(message) {
        let split = message.split(' ');
        let players = [];

        for (let i = 1; i < split.length; i++) {
            if (split[i].trim() != "") {
                players.push({username: split[i], x: 0, y: 0, dir: '-d'});
            }
        }

        return players;
    },
    createPasswordInput: function() {
        let pass1 = document.getElementById('modalInputPassword1').value;
        let pass2 = document.getElementById('modalInputPassword2').value;
        if (pass1 != pass2) {
            document.getElementById('modalInputPassword2').value = "";
        } else {
            if (pass1.trim() == "") {
                document.getElementById('modalInputPassword1').value = "";
                document.getElementById('modalInputPassword2').value = "";
            } else {
                document.getElementById('modalInputPassword1').value = "";
                document.getElementById('modalInputPassword2').value = "";
                this.socket.send("[AUTH] " + pass1);
                modal('modalInputUser').hide();
            }
        }
    },
    oninit: function(e) {
    },
    onmessage: function(e) {
        if (e.data.startsWith('[VERSION] ')) {
            if (e.data.substr(10) == communication.TDR || communication.ignoreServerVersion) {
                communication.reset();
                modal('modalInputUser').show();
            } else {
                this.close(3000, "TDR or PTDR not matching");
            }
        } else if (e.data.startsWith('[AUTH] CREATE')) {
            document.getElementById('modalInputCreate').hidden = false;
            document.getElementById('modalInputPassword1').select();
        } else if (e.data.startsWith('[AUTH] VALIDATE')) {
            document.getElementById('modalInputPassword').hidden = false;
            document.getElementById('modalInputPassword0').select();
        } else if (e.data.startsWith('[AUTH-OK]')) {
            communication.onlineUsers = communication.playersFromAuth(e.data);
        } else if (e.data.startsWith('[USER-JOINED] ')) {
            if (!communication.hasUsername(e.data.split(' ')[1])) {
                this.resendState = true;
                communication.onlineUsers.push({username: e.data.split(' ')[1], x: 0, y: 0, dir: '-d'});
            }
        } else if (e.data.startsWith('[USER-LEFT] ')) {
            communication.removeUser(e.data.split(' ')[1]);
        } else if (e.data.startsWith('[STATE] ')) {
            let name = e.data.split(' ')[1];
            let x = parseFloat(e.data.split(' ')[2]);
            let y = parseFloat(e.data.split(' ')[3]);
            let dir = "-d";
            try {
                dir = e.data.split(' ')[4];
            } catch (e) {};

            communication.onlineUsers.forEach(user => {
                if (user.username == name) {
                    user.x = x;
                    user.y = y;
                    user.dir = dir;
                }
            });
        } else if (e.data.startsWith('[CHAT] ')) {
            document.getElementById('chat-div').innerHTML += formatColors(e.data.substr(7)) + "<br>"; // Section Symbol --> §§§§§§
            document.getElementById('chat-div').scrollTop = document.getElementById('chat-div').scrollHeight;
        } else {
            console.log(e);
        }
    },
    onerror: function(e) {
        console.error(e);
    },
    onclose: function(e) {
        document.getElementById('chat-div').innerText = "";
        if (e.code == 3001) {
            communication.reconnect();
        } else {
            communication.reset();

            document.getElementById('modalDisconnectedCode').innerText = "Disconnected (" + e.code + ")";
            if (e.reason && e.reason.trim() != "") {
                document.getElementById('modalDisconnectedMessage').innerText = e.reason;
                replaceWithFormatting(document.getElementById('modalDisconnectedMessage'));
            } else {
                document.getElementById('modalDisconnectedMessage').innerText = "Unknown reason";
            }
            modal('modalDisconnected').show();
        }
    }
};

let textures = {};
{
    let imgs = document.getElementsByTagName('img');
    for (let i = 0; i < imgs.length; i++) {
        if (imgs[i].getAttribute('type') == "texture") {
            imgs[i].hidden = true;
            textures[imgs[i].getAttribute('name')] = imgs[i];
        }
    }
}

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

if (location.search != "") {
    let search = parseQuery(location.search);

    if (search.ignoreserverversion) {
        communication.ignoreServerVersion = true;
    }

    if (search.ip && search.port) {
        communication.connect(search.ip, search.port);
    }
}

document.addEventListener('readystatechange', function(event) {
    document.getElementById('chat-message-div').onkeydown = function(e) {
        if (e.key == "Enter") {
            let message = document.getElementById('chat-message-div').innerText.replaceAll('\n', '').replaceAll('\r', '').replaceAll('§', '');
            
            setTimeout(function() {
                document.getElementById('chat-message-div').innerText = "";
            }, 2);

            if (communication.socket.readyState == 1 && message.trim() != "") {
                communication.socket.send("[CHAT] " + message);
            }
        }
    };

    index.startGame();
}, false);

let index = {
    startGame: function() {
        console.log("Game started!");
        dimensions.start();
        gamepad.start();
        keyboard.start();
        mainloop.iterate(0);
    }
};