export default {
    async init(world, seed, ox=0, oy=0) {
        Math.seedrandom(seed);
        perlin.seed();
        const MAP_SIZE = 20;
        for (let x = -MAP_SIZE; x <= MAP_SIZE; x++) {
            for (let y = -MAP_SIZE; y < MAP_SIZE; y++) {
                const height = perlin.get((x+ox) / 1024, (y+oy) / 1024);
                let tiletype = 'grass';
                if (height < -0.005) tiletype = 'sand';
                if (height < -0.01) tiletype = 'water';
                if (height > 0.025) tiletype = 'stone';
                if (height > 0.05) tiletype = 'deepstone';
                if (height > 0.1) tiletype = 'deeperstone';
                world.tiles.push(
                    this.createTile(tiletype, x+ox, y+oy)
                );
            }
        }
    },
    isVisible(tile, camera, tw, th) {
        const px = (tile.x * tw - camera.x) * 4;
        const py = (tile.y * th - camera.y) * 4;
        if (px + tw*5 < -window.innerWidth / 2) return false;
        if (px - tw*5 > window.innerWidth / 2) return false;
        if (py + th*5 < -window.innerHeight / 2) return false;
        if (py - th*5 > window.innerHeight / 2) return false;
        return true;
    },
    createTile(id, x, y) {
        return {
            type: 'tile',
            id, x, y
        }
    },
    render(render, { tw, th, tex, tiles, cam }) {
        tiles.forEach(tile => {
            if (this.isVisible(tile, cam, tw, th))
                render.texture(tex[tile.id], tile.x * tw, tile.y * th);
        });
    }
}