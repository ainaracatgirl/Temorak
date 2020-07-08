// Key listener with simple get functions

let keyboard = {
    keys: new Array(),
    start: function() {
        window.addEventListener('keydown', function(event) {
            if (event.target == document.body) {
                keyboard.keys.push(event.key.toLowerCase());
            }
        });
        window.addEventListener('keyup', function(event) {
            if (event.target == document.body) {
                keyboard.keys.remove(event.key.toLowerCase());
            }
        });
    },
    keyDown: function(key) {
        return keyboard.keys.indexOf(key.toLowerCase()) != -1;
    },
    keyUp: function(key) {
        return keyboard.keys.indexOf(key.toLowerCase()) == -1;
    },
    reset: function() {
        keyboard.keys.length = 0;
    }
};