let keyboard = {
    keys: new Array(),
    start: function() {
        window.addEventListener('keydown', function(event) {
            keyboard.keys.push(event.key);
        });
        window.addEventListener('keyup', function(event) {
            keyboard.keys.remove(event.key);
        });
    },
    keyDown: function(key) {
        return keyboard.keys.indexOf(key) != -1;
    },
    keyUp: function(key) {
        return keyboard.keys.indexOf(key) == -1;
    },
    reset: function() {
        keyboard.keys.length = 0;
    }
};