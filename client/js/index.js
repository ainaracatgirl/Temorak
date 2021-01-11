// TEMORAK Copyright (c) 2021 jDev

// Set up fancy logging methods
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

// Prototype modifications
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

/**
 * Formats innerText to validate formatting tags
 * 
 * @param {HTMLElement} element 
 */
function replaceWithFormatting(element) {
    element.innerHTML = element.innerHTML.replace('&lt;b&gt;', '<b>').replace('&lt;/b&gt;', '</b>');
}

/**
 * Transforms a text (txt) into a safe HTML (innerHTML), it also parses some color codes
 * 
 * @param {String} txt 
 */
function formatColors(txt) {
    return txt.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("§a", "<span style=\"color: green;\">").replaceAll("§b", "<span style=\"color: aqua;\">").replaceAll("§c", "<span style=\"color: red;\">").replaceAll("§d", "<span style=\"color: purple;\">").replaceAll("§e", "<span style=\"color: yellow;\">").replaceAll("§f", "<span style=\"color: white;\">");
}

/**
 * Creates a "modal" object for the modal div with it's id being the one specified
 * 
 * @param {String} id 
 */
function modal(id) {
    let struct = {
        dom: document.getElementById(id),
        /**
         * Shows the modal
         */
        show: function() {
            this.dom.style.display = "block";
        },
        /**
         * Hides the modal
         */
        hide: function() {
            this.dom.style.display = "none";
        },
        /**
         * Sets the button (id) to show the modal
         * 
         * @param {String} id 
         */
        setButton: function(id) {
            document.getElementById(id).onclick = this.show;
        }
    };
    return struct;
}

// Add "enter" as a way of pressing the buttons, also autoselect fields
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

/**
 * The current world struct, received from server
 */
let world = null;

/**
 * Communication struct
 */
let communication = {
    // Terminal development report, version control
    TDR: "TDR-1 PTDR-5",
    // Online users, sent by server
    onlineUsers: [],
    // The username the local user has selected
    localUsername: null,
    // If the client should sent its state
    resendState: false,
    // The WebSocket object
    socket: null,
    // The last connected host, used by reconnect
    lastHost: null,
    // The last connected port, used by reconnect
    lastPort: null,
    // If the client should ignore the server incompatibility
    ignoreServerVersion: false,
    /**
     * Connects to a server
     * 
     * @param {String} host 
     * @param {Number} port 
     */
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
    /**
     * Resets all the fields used on the communication
     */
    reset: function() {
        world = undefined;
        this.onlineUsers = [];
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
    /**
     * Reconnects to the last connected server
     */
    reconnect: function() {
        this.connect(this.lastHost, this.lastPort);
    },
    /**
     * Called on sending username
     */
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
    /**
     * Called on sending password
     */
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
    /**
     * Removes a user from onlineUsers
     * 
     * @param {String} username 
     */
    removeUser: function(username) {
        for (let i = 0; i < communication.onlineUsers.length; i++) {
            if (communication.onlineUsers[i].username == username) {
                communication.onlineUsers.splice(i, 1);
                return;
            }
        }
    },
    /**
     * Check if a user is currently online
     * 
     * @param {String} username 
     */
    hasUsername: function(username) {
        for (let i = 0; i < communication.onlineUsers.length; i++) {
            if (communication.onlineUsers[i].username == username) {
                return true;
            }
        }

        return false;
    },
    /**
     * Parses an authentication message to get onlinePlayers
     * 
     * @param {String} message 
     */
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
    /**
     * Called on creating a password
     */
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
    /**
     * Called when the WebSocket connects, tbh I don't think I will use it.
     * 
     * @param {Event} e 
     */
    oninit: function(e) {
    },
    /**
     * Called when a message gets received from the WebSocket
     * 
     * @param {Event} e 
     */
    onmessage: function(e) {
        if (e.data.startsWith('[VERSION] ')) {
            if (e.data.substr(10) == communication.TDR || communication.ignoreServerVersion || e.data.substr(10) == "") {
                communication.reset();
                modal('modalInputUser').show();
            } else {
                this.close(3000, "Incorrect server/client version\r\n\r\nTDR or PTDR not matching");
            }
        } else if (e.data.startsWith('[AUTH] CREATE')) {
            document.getElementById('modalInputCreate').hidden = false;
            document.getElementById('modalInputPassword1').select();
        } else if (e.data.startsWith('[AUTH] VALIDATE')) {
            document.getElementById('modalInputPassword').hidden = false;
            document.getElementById('modalInputPassword0').select();
        } else if (e.data.startsWith('[AUTH-OK]')) {
            communication.onlineUsers = communication.playersFromAuth(e.data);
        } else if (e.data.startsWith('[LAGCHECK] ')) {
            let time = parseInt(e.data.substr(11));
            let now = Date.now();
            let ping = now - time;
            let color = 'green';
            if (ping > 20) {
                color = "yellowgreen";
            }
            if (ping > 50) {
                color = "yellow";
            }
            if (ping > 80) {
                color = "orange";
            }
            if (ping > 120) {
                color = "red";
            }
            document.getElementById('chat-div').innerHTML += '<span style="color: lightgray;">Your current ping is </span><span style="color: ' + color + ';">' + ping + 'ms</span><br>';
            document.getElementById('chat-div').scrollTop = document.getElementById('chat-div').scrollHeight;
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
            let dir = "--";
            try {
                dir = e.data.split(' ')[4];
            } catch (e) {};

            communication.onlineUsers.forEach(user => {
                if (user.username == name) {
                    user.x = x;
                    user.y = y;
                    if (dir != "--") {
                        user.dir = dir;
                    }
                }
            });
        } else if (e.data.startsWith('[CHAT] ')) {
            document.getElementById('chat-div').innerHTML += formatColors(e.data.substr(7)) + "<br>"; // Section Symbol --> §§§§§§
            document.getElementById('chat-div').scrollTop = document.getElementById('chat-div').scrollHeight;
        } else if (e.data.startsWith('[WORLD] ')) {
            world = JSON.parse(e.data.substr(8));
        } else {
            console.log(e);
        }
    },
    /**
     * Called when there's an error with the WebSocket
     * 
     * @param {Event} e 
     */
    onerror: function(e) {
        console.error(e);
    },
    /**
     * Called when the connection between the client and the server gets closed
     * 
     * @param {Event} e 
     */
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

// All the textures get parsed and saved here
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

/**
 * Parses the queryString from the locationbar into a dictionary
 * 
 * @param {String} queryString 
 */
function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

function shareServer(host, port) {
    document.getElementById('shareServerLink').innerText = location.origin + location.pathname + "?ip=" + host + "&port=" + port;
    modal('shareServer').show();
}

let serverSelectDev = false;
document.getElementById('serverSelectDev').oninput = function(e) {
    serverSelectDev = !serverSelectDev;
    document.getElementById('serverDevList').hidden = !serverSelectDev;
};

let onclick_copies = document.getElementsByClassName('onclick-copy');
for (let i = 0; i < onclick_copies.length; i++) {
    onclick_copies[i].onclick = function() {
        const el = document.createElement("textarea");
        el.value = onclick_copies[i].innerText;
        document.body.append(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        onclick_copies[i].innerText = "Copied!";
    };
}

// Parse & actuate acordingly to the queryString
if (location.search != "") {
    let search = parseQuery(location.search);

    if (search.ignoreserverversion) {
        communication.ignoreServerVersion = true;
    }

    if (search.ip && search.port) {
        communication.connect(search.ip, search.port);
    } else {
        loadServers();
    }
} else {
    loadServers();
}

function loadServers() {
    let servers = document.getElementsByClassName("server-listed");
    for (let i = 0; i < servers.length; i++) {
        let server = servers[i];
        let html = "";

        html += server.attributes.name.value;
        html += "<span style=\"color: gold;\">  pinging...</span><br>";
        html += "<br><hr><br>";

        server.innerHTML = html;
        html = "";

        let ws = new WebSocket("ws://" + server.attributes.host.value + ":" + server.attributes.port.value);
        ws.onopen = function() {
            html += server.attributes.name.value;
            html += "<span style=\"color: green;\">  up</span><br>";
            html += '<button onclick="communication.connect(\'' + server.attributes.host.value + '\', ' + server.attributes.port.value + '); modal(\'serverSelect\').hide();">Join</button>  ';
            html += '<button onclick="shareServer(\'' + server.attributes.host.value + '\', ' + server.attributes.port.value + '); modal(\'serverSelect\').hide();">Share</button>';
            html += "<br><hr><br>";
            server.innerHTML = html;
            ws.close();
        };
        ws.onerror = function() {
            server.id = "serverlist_remove" + i;
            html += server.attributes.name.value;
            html += "<span style=\"color: red;\">  down</span><br>";
            html += '<button onclick="document.getElementById(\'' + server.id + '\').remove();">Remove</button>';
            html += "<br><hr><br>";
            server.innerHTML = html;
        };
    }
    modal('serverSelect').show();
}

// To be able to chat
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

// When the page gets loaded
document.addEventListener('readystatechange', function(event) {
    index.startGame(); // Start the game
}, false);

// The index struct
let index = {
    startGame: function() {
        console.log("Game started!");
        dimensions.start();
        gamepad.start();
        keyboard.start();
        mainloop.iterate(0);
    }
};