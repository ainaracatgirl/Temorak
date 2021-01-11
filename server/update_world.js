// TEMORAK Copyright (c) 2021 jDev

const fs = require('fs');

function readWorld(filename) {
    let world = {};
    let f = filename;
    try {
        world = JSON.parse(fs.readFileSync(filename) + "");
        f = filename;
    } catch (e) {
        try {
            world = JSON.parse(fs.readFileSync(filename + ".json") + "");
            f = filename + ".json";
        } catch (e) {
            try {
                world = JSON.parse(fs.readFileSync("worlds/" + filename) + "");
                f = "worlds/" + filename;
            } catch (e) {
                try {
                    world = JSON.parse(fs.readFileSync("worlds/" + filename + ".json") + "");
                    f = "worlds/" + filename + ".json";
                } catch (e) {
                    world = {};
                    f = filename;
                }
            }
        }
    }
    return [ world, f ];
}

if (process.argv.length > 2) {
    let filename = process.argv[2];
    let _ = readWorld(filename);
    let wOld = _[0];
    filename = _[1];
    let wNew = {};

    if (wOld.version == "TDR-1") {
        console.warn("(World is up to date, format hasn't changed)");
        wNew = wOld;
    }

    fs.writeFileSync(filename, JSON.stringify(wNew));
    console.log("World updated from version " + wOld.version + " to TDR-1");
} else {
    console.log("Please, specifiy a Temorak World File to update it");
}