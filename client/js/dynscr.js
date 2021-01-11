// TEMORAK Copyright (c) 2021 jDev

// Just an anti-caching for JS, made by jancraft888

let DYNSCR = {
    scripts: [],
    work: function() {
        this.scripts = document.getElementsByTagName("dynsrc");
        while (this.scripts.length != 0) {
            let src = this.scripts[0].attributes.src.value + "?v=" + Date.now();
            let script = document.createElement('script');
            document.body.removeChild(this.scripts[0]);
            script.src = src;
            document.body.append(script);
        }
    }
};
DYNSCR.work();