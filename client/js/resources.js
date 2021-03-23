let textures = {};
let imgs = document.getElementsByTagName('img');
for (let i = 0; i < imgs.length; i++) {
    if (imgs[i].getAttribute('type') == "texture") {
        imgs[i].hidden = true;
        textures[imgs[i].getAttribute('name')] = imgs[i];
    }
}

export default {
    textures
}