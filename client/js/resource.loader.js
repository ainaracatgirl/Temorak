// TEMORAK Copyright (c) 2021 jDev

// So Temorak can load [text & json] resources

function getResource(name) { // returns a resource
    return RSLOADER.rs[name];
}

function r3qu3stSync(path, mode='GET') { // Request synchronously (deprecated), so I don't have to use PROMISES or ASYNC functions
// (as of 2021 I would have used async/await but I'm too busy to re-code everything)
    var request = new XMLHttpRequest();
    request.open(mode, path, false);
    request.send(null);

    return request.response;
}

// Just loads everything when the file loads
let RSLOADER = {
    resources: [],
    rs: [],
    textOf: function(src) {
        return r3qu3stSync(src);
    },
    work: function() {
        this.resources = document.getElementsByTagName("resource");
        while (this.resources.length != 0) {
            let src = this.resources[0].attributes.src.value + "?v=" + Date.now();
            let type = this.resources[0].attributes.type.value;
            let name = this.resources[0].attributes.name.value;

            if (type == "json") {
                this.resources[name] = JSON.parse(this.textOf(src));
            } else if (type == "text") {
                this.resources[name] = this.textOf(src);
            } else {
                console.error("[ERROR] ResourceLoader can't load type '%s'", type);
            }

            document.body.removeChild(this.resources[0]);
        }
    }
};
RSLOADER.work();