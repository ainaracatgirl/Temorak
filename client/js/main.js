import utils from './utils.js'
import dimensions from './dimensions.js';
import RenderModule from './render.js';
import resources from './resources.js';
const render = new RenderModule();
import tiles from './tiles.js';
import gamepad from './gamepad.js';
import input from './input.js';
import networking from './networking.js';

const VERSION = "v0.1.14";

const world = {
    tiles: [],
    players: [],
    entities: []
}
const camera = {
    x: 0,
    y: 0,
    _x: 0,
    _y: 0,
    dir: 1,
    _dir: 1,
    rot: 0,
    _rot: 360,
    health: 3,
    stamina: 10,
    old_hp: 3,
    old_stamina: 10,
    hp_shake: 0,
    stamina_shake: 0,
    isDead: false
}
let deathScreenAlpha = 1;
window.camera = camera;

const canvas = document.getElementById('content');
dimensions.init(canvas);
tiles.init(world);
const inputGamepad = gamepad.init();
const inputAll = input.init(inputGamepad);
networking.init({
    version_str: VERSION
});

render.init(canvas, 
    /** @param {CanvasRenderingContext2D} ctx */ (ctx) => {
    tick();

    const PIXELS_PER_ROW = canvas.width / dimensions.TILE_W * 4;
    const PIXELS_PER_COLUMN = canvas.height / dimensions.TILE_H * 4;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(canvas.width / PIXELS_PER_ROW, canvas.height / PIXELS_PER_COLUMN);

    ctx.translate(-camera._x, -camera._y);
    ctx.translate(PIXELS_PER_ROW / 2, PIXELS_PER_COLUMN / 2);

    tiles.render(render, {
        tw: dimensions.TILE_W,
        th: dimensions.TILE_H,
        tex: resources.textures,
        tiles: world.tiles,
        cam: camera
    });

    ctx.translate(camera._x, camera._y);
    ctx.scale(camera._dir, 1);
    ctx.rotate(camera._rot * Math.PI / 180);
    render.texture(resources.textures.player_wh, 0, 0);
    
    ctx.restore();

    // HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.save();
    {
        ctx.translate(canvas.width / 4, canvas.height - 70);
        ctx.fillRect(0, 0, canvas.width / 2, 64);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(196, 8, 48, 48);
        ctx.fillRect(196+64, 8, 48, 48);
        ctx.fillRect(196+64*2, 8, 48, 48);
        ctx.fillRect(196+64*3, 8, 48, 48);
        
        ctx.scale(2, 2);
        ctx.fillStyle = 'white';
        ctx.font = '16px pixel-vt323-regular';

        const hp_shakex = (Math.random() * camera.hp_shake) * 1;
        const hp_shakey = (Math.random() * camera.hp_shake) * 1;
        const stamina_shakex = (Math.random() * camera.stamina_shake) * 1;
        const stamina_shakey = (Math.random() * camera.stamina_shake) * 1;

        render.texture(resources.textures.heart, 16 + hp_shakex, 16 + hp_shakey);
        ctx.fillText("x" + camera.health.toFixed(0), 26, 20);

        render.texture(resources.textures.bolt, 54 + stamina_shakex, 16 + stamina_shakey);
        ctx.fillText("x" + camera.stamina.toFixed(0), 60, 20);
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, ' + deathScreenAlpha + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

function tick() {
    camera._x = dimensions.serp(camera._x, camera.x, 2);
    camera._y = dimensions.serp(camera._y, camera.y, 2);
    camera._dir = dimensions.lerp(camera._dir, camera.dir, 0.25);
    camera._rot = dimensions.lerp(camera._rot, camera.rot, 0.25);
    camera.hp_shake = dimensions.serp(camera.hp_shake, 0, 0.5);
    camera.stamina_shake = dimensions.serp(camera.stamina_shake, 0, 0.5);

    deathScreenAlpha = dimensions.lerp(deathScreenAlpha, camera.isDead ? 1 : 0, 0.05);
    if (deathScreenAlpha >= 0.99) {
        camera.health = 3;
        camera.stamina = 10;
        camera.isDead = false;

        camera._rot = 360;
        camera.x = 0;
        camera.y = 0;
        camera._x = 0;
        camera._y = 0;
    }

    if (camera.old_hp != camera.health) {
        camera.hp_shake = 5;
    }
    if (camera.old_stamina != camera.stamina) {
        camera.stamina_shake = 5;
    }
    camera.old_stamina = camera.stamina;
    camera.old_hp = camera.health;

    if (camera.stamina < 10) {
        camera.stamina += 0.005;
        camera.old_stamina += 0.005;
    }

    if (camera.stamina < 2) {
        camera.stamina_shake = 2;
    }
    if (camera.health <= 0) {
        camera.health = 0;
        camera.isDead = true;
    }
    if (camera.health > 99) {
        camera.stamina += camera.health - 99;
        camera.health = 99;
    }

    inputGamepad.poll();
    inputAll.update(true);
    inputAll.normalizeMotionAxis();
    if (inputAll.openChat) {
        document.getElementById('chat-message-div').focus();
    }

    const EPSILON = 0.1;
    if (Math.abs(camera.x - camera._x) < EPSILON && Math.abs(camera.y - camera._y) < EPSILON) {
        camera.x += inputAll.motion_axis[0] * 16;
        camera.y += inputAll.motion_axis[1] * 16;
        if (inputAll.motion_axis[0] != 0)
            camera.dir = inputAll.motion_axis[0] * -1;
        camera.rot = inputAll.motion_axis[1] * -90;
    }

    if (inputGamepad.gamepads.length > 0) {
        document.getElementById('gamepad-icon').hidden = false;
    } else {
        document.getElementById('gamepad-icon').hidden = true;
    }
}