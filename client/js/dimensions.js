// Module for tracking the width & height of the window
let dimensions = {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    tileSize: 64,
    start: function() {
        window.addEventListener('resize', function(event) {
            dimensions.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            dimensions.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            
            document.getElementById('content').width = dimensions.width;
            document.getElementById('content').height = dimensions.height;
        }, false);

        document.getElementById('content').width = dimensions.width;
        document.getElementById('content').height = dimensions.height;
    }
};