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

function replaceWithFormatting(element) {
    element.innerHTML = element.innerHTML.replace('&lt;b&gt;', '<b>').replace('&lt;/b&gt;', '</b>');
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

let communication = {
    TDR: "TDR-1 PTDR-1",
    socket: null,
    lastHost: null,
    lastPort: null,
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
            if (e.data.substr(10) == communication.TDR) {
                communication.reset();
                modal('modalInputUser').show();
            } else {
                this.close(3000, "TDR or PTDR not matching");
            }
        } else if (e.data.startsWith('[AUTH] CREATE')) {
            document.getElementById('modalInputCreate').hidden = false;
        } else if (e.data.startsWith('[AUTH] VALIDATE')) {
            document.getElementById('modalInputPassword').hidden = false;
        } else {
            console.log(e);
        }
    },
    onerror: function(e) {
        console.error(e);
    },
    onclose: function(e) {
        if (e.code == 3001) {
            communication.reconnect();
        } else {
            communication.reset();

            document.getElementById('modalDisconnectedCode').innerText = "Disconnected (" + e.code + ")";
            if (e.reason && e.reason.trim() != "") {
                document.getElementById('modalDisconnectedMessage').innerText = e.reason;
                replaceWithFormatting(document.getElementById('modalDisconnectedMessage'));
            }
            modal('modalDisconnected').show();
            console.log(e);
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

    if (search.ip && search.port) {
        communication.connect(search.ip, search.port);
    }
}

document.addEventListener('readystatechange', function(event) {
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