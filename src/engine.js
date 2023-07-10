
/*
________  ________   ________  ___  ________   _______      
|\   __  \|\   ___  \|\   ____\|\  \|\   ___  \|\  ___ \     
\ \  \|\  \ \  \\ \  \ \  \___|\ \  \ \  \\ \  \ \   __/|    
 \ \  \\\  \ \  \\ \  \ \  \  __\ \  \ \  \\ \  \ \  \_|/__  
  \ \  \\\  \ \  \\ \  \ \  \|\  \ \  \ \  \\ \  \ \  \_|\ \ 
   \ \_____  \ \__\\ \__\ \_______\ \__\ \__\\ \__\ \_______\
    \|___| \__\|__| \|__|\|_______|\|__|\|__| \|__|\|_______|
          \|__|                                              

                • Qngine by @QwertyR0
                •    LICENSE: MIT
                •        2023
                
                •    Version: 1.0
*/

import sdl from '@kmamal/sdl';
import { createCanvas, loadImage } from 'canvas';
import path from "path";
import fs from 'fs';
import { setTimeout } from 'timers/promises';
import imageSize from 'image-size'; //Probaly will find a better way
import { loadImagea } from './ffmpeg.js';
import playsound from "sound-play";

let game = {
    isPlaying: true
};
let pluginsObj = {
    plugins: new Map(),
    sharedVaribles: {},
    pl: {},
    kit: {},
    sharedVars: []
};

game.folder = process.argv[2];
game.config = JSON.parse(fs.readFileSync(path.join(process.cwd(), game.folder, 'config.json'), 'utf8'));
game.main = fs.readFileSync(path.join(process.cwd(), game.folder, game.config.gameFile));

const main = await import("file://" + path.join(process.cwd(), game.folder, game.config.gameFile));

const _w = (game.config.width ? game.config.width : undefined);
const _h = (game.config.height ? game.config.height : undefined);

const window = sdl.video.createWindow({ title: game.config.title, width: _w, height: _h });
const canvas = createCanvas(window.width, window.height);
const ctx = canvas.getContext('2d');

//icon thingys:

// WILL BE FIXED: doesn't being showed at the bar(down)  
if(game.config.icon) {
    if(game.config.icon.startsWith("./") || game.config.icon.startsWith("../") || game.config.icon.startsWith("/")){
        game.icon = path.join(process.cwd(), game.folder, game.config.icon);
    }

    const iconDimensions = imageSize(game.icon);
    const icon = await loadImagea(game.icon, { width: iconDimensions.width, height: iconDimensions.height });
    window.setIcon(iconDimensions.width, iconDimensions.height, iconDimensions.width*3, 'rgb24', icon);
}

// end of icon thingys

game.config.pos = game.config.pos ? game.config.pos : {};

ctx.imageSmoothingEnabled = (game.config.imageSmoothing ? true : false);
window.setBorderless((game.config.borderless ? true : false));

let gameObjects = [];
let animations = [];
let keysDown = [];
let mouseDown = {
    left: false,
    right: false,
    middle: false,
    x: 0,
    y: 0
};
let joysticks = [];

let w = {
    width: window.width,
    height: window.height,
    io: {}
    //protagonistSoundEnabled: game.config.protagonistSoundEnabled ? game.config.protagonistSoundEnabled : false,
    //protagonistSound: null
};

w.exit = function() {
    process.exit();
};  

w.minimize = function(){
    window.minimize();
};

w.maximize = function(){
    window.maximize();
};

w.setBorderless = function(boole) {
    window.setBorderless(boole);
    w.borderless = boole;
}

w.borderless = game.config.borderless;
 
w.setPos = function(x, y){
    window.setPosition(x, y);
}

if(typeof game.config.pos.x === typeof 1 && typeof game.config.pos.y === typeof 1){
    w.setPos(game.config.pos.x, game.config.pos.y);
}

w.getPos = function(){
    return { x: window.x, y: window.y };
}

w.setTitle = function(title){
    window.setTitle(title);
}

/*
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
*/

game.config.isPlaying = true;

// PLUGINS:

const init = async (filePath) => {
    const { default: plugin } = await import("file://" + filePath);
    pluginsObj.plugins.set(plugin.name, plugin)
};

const loadPlugins = async () => {
    const pluginsDir = path.join(process.cwd(), './src/plugins/');
    const pluginFiles = fs.readdirSync(pluginsDir);

    for (const file of pluginFiles) {
        const filePath = `${pluginsDir}${file}`;
        await init(filePath);
    }
};

await loadPlugins()
//     .then(() => {
//         console.log('All plugins loaded and executed successfully.');
// })
//     .catch((error) => {
//         console.error('Error loading plugins:', error);
// });


pluginsObj.kit.callEvent = function(){
    const eventToCall = arguments[0];
    const options = arguments[1];

    if(typeof main[eventToCall] !== 'undefined' && main[eventToCall] instanceof Function){
        main[eventToCall](...(arguments.slice(2)));
    }

    if(options.pluginShare){
        pluginsObj.plugins.forEach((plg) => {
            if(typeof plg[eventToCall] !== 'undefined' && plg[eventToCall] instanceof Function){
                plg[eventToCall](...(arguments.slice(2)));
            }
        })
    }
}


/*
{
    id: "test",
    value: 123,
}
*/

pluginsObj.kit.createSharedVar = function(id, val){
    if(!pluginsObj.sharedVars.includes(pv => pv.id === id)){
        pluginsObj.sharedVars.push({
            id: id,
            value: val
        });
        return true;
    } else {
        return false;
    }
}

pluginsObj.kit.getSharedVar = function(id){
    const sharedV = pluginsObj.sharedVars.find(pv => pv.id === id);

    if(sharedV){
        return sharedV.value;
    } else {
        return false;
    }
}

pluginsObj.kit.editSharedVar = function(id, val){
    const sharedV = pluginsObj.sharedVars.findIndex((pv => pv.id == id));

    if(sharedV){
        pluginsObj.sharedVars[sharedV].value = val;
        return true;
    } else {
        return false;
    }
}

// END OF PLUGINS


// GRAPHICS:

w.loadImage = async function(imagePath){
    if(imagePath.startsWith("./") || imagePath.startsWith("../") || imagePath.startsWith("/")){
        imagePath = path.join(process.cwd(), game.folder, imagePath);
    }

    const dimensions = imageSize(imagePath) // maybe optimize here later
    return { image: await loadImage(imagePath), width: dimensions.width, height: dimensions.height };
};

const graphics = {
    line: function(fx, fy, nx, ny, color, widtha){
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(nx, ny);
        if (widtha){
            ctx.lineWidth = widtha;
        }
        if (color){
            ctx.strokeStyle = color;
        }
        ctx.stroke();

        if(game.config.enableWhiteByDefault){
            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
        };
    },

    rectangle: function(type, fx, fy, nx, ny, color, options = {}){
        options.widtha = options.widtha || 0;
        options.rotation = options.rotation || null;

        if(typeof options.rotation === typeof 1) ctx.save();
        ctx.beginPath();
        if(typeof options.rotation === typeof 1){
            ctx.translate(fx + nx / 2, fy + ny / 2);
            ctx.rotate((options.rotation * Math.PI) / 180);
            ctx.translate(-nx / 2, -ny / 2);
        }

        if(type === "fill"){
            if (color){
                ctx.fillStyle = color;
            }
            ctx.fillRect(fx, fy, nx, ny);
            ctx.restore();
        } else if(type === "border"){
            if (options.widtha){
                ctx.lineWidth = options.widtha;
            }
            if (color){
                ctx.strokeStyle = color;
            }
            ctx.rect(fx, fy, nx, ny);
            ctx.stroke();
        }

        if(typeof options.rotation === typeof 1) ctx.restore();

        if(game.config.enableWhiteByDefault){
            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
        };
    },

    circle: function(type, fx, fy, rad, color){
        ctx.beginPath();
        ctx.arc(fx, fy, rad, 0, 2 * Math.PI, false);

        if(color && type === "fill"){
            ctx.fillStyle = color;
            ctx.fill();
        } else if(type === "border") {
            ctx.stroke();
        }
        
        if(game.config.enableWhiteByDefault){
            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
        };
    },

    text: function(text, fx, fy, options) {
        let font = options && typeof options.font === "string" ? options.font : "Arial";
        let scale = options && typeof options.scale === "number" ? options.scale : 20;
        let italic = options && options.italic ? "italic" : "normal";
        let bold = options && options.bold ? "bold" : "normal";
        let align = options && typeof options.align === "string" ? options.align : "start";
        let color = options && typeof options.color === "string" ? options.color : (game.config.enableWhiteByDefault ? "white" : "black");
        let style = options && typeof options.style === "string" ? options.style : "fill";
      
        ctx.font = italic + " " + bold + " " + scale + "px " + font;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.textAlign = align;
      
        if (style === "fill") {
          ctx.fillText(text, fx, fy);
        } else if (style === "border") {
          ctx.strokeText(text, fx, fy);
        }

        if(game.config.enableWhiteByDefault){
            ctx.fillStyle = "white";
            ctx.strokeStyle = "white";
        };
    },

    image: function(image, fx, fy, options = {}) {
         
        options = { ...{ scaleX: 1, scaleY: 1, flipX: false, flipY: false, rotation: 0 }, ...options };
        
        if (typeof options.scaleX !== 'number' || typeof options.scaleY !== 'number' || typeof options.flipX !== 'boolean' || typeof options.flipY !== 'boolean' || typeof options.rotation !== 'number') {
          return;
        }
      
        ctx.save();
        ctx.translate(fx + image.width * options.scaleX / 2, fy + image.height * options.scaleY / 2);
        if (options.flipX) ctx.scale(-1, 1);
        if (options.flipY) ctx.scale(1, -1);
        ctx.rotate((options.rotation * Math.PI) / 180);
        ctx.drawImage(image.image, -image.width * options.scaleX / 2, -image.height * options.scaleY / 2, image.width * options.scaleX, image.height * options.scaleY);
        ctx.restore();
      
        if (game.config.enableWhiteByDefault) {
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'white';
        }
    }      
};

graphics.ctx = ctx;

export class SpriteSheet{
    constructor(image, width, height, cols, rows, totalSprites, options){
        this.image = image;
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;
        this.totalSprites = totalSprites;
        this.currentFrame = 0;
        this.options = options;
        this.flipY = false;
        this.flipX = false;
    }
    
    setFrame(frameNum){
        if (frameNum >= 0 && frameNum < this.totalSprites) {
            this.currentFrame = frameNum;
        } else {
            console.error('Invalid frame number');
        }
    }

    draw(x, y, options = { flipX: false, flipY: false, rotation: 0 }) {
        options = { ...{ flipX: false, flipY: false, rotation: 0 }, ...options };

        const col = this.currentFrame % this.rows;
        const row = this.currentFrame % this.cols;
        const sx = col * this.width;
        const sy = row * this.height;

        if(this.flipY){
            options.flipY = true;
        }

        if(this.flipX){
            options.flipX = true;
        }

        ctx.save();
        ctx.translate(x, y);
        if (options.flipX) {
            ctx.scale(-1, 1);
            ctx.translate(-this.width * this.options.scale, 0);
        }
        if (options.flipY) {
            ctx.scale(1, -1);
            ctx.translate(0, -this.height * this.options.scale);
        }
        ctx.rotate((options.rotation * Math.PI) / 180);
    
        if (this.options.scale) {
            ctx.drawImage(this.image.image, sx, sy, this.width, this.height, 0, 0, this.width * this.options.scale, this.height * this.options.scale);
        } else {
            ctx.drawImage(this.image.image, sx, sy, this.width, this.height, 0, 0, this.width, this.height);
        }
    
        ctx.restore();

    }

    getCurrentFrame(){
        return this.currentFrame;
    }
}

w.SpriteSheet = SpriteSheet;

class Animation {
    constructor(SpriteSheet, frameDuration, anim, options){
        this.SpriteSheet = SpriteSheet;                
        this.frameDuration = frameDuration;   
        this.currentFrameIndex = 0;           
        this.elapsedTime = 0;                 
        this.animationCycle = anim;    
        this.isPlaying = false;
        this.cylceIndex = 0;
        this.options = this.options || {};;
        this.options.flipArray = typeof this.options.flipArray !== 'undefined' ? this.options.flipArray : [];
    }

    play(){
        this.isPlaying = true;
    }

    stop(){
        this.play = false;
        this.currentFrameIndex = 0;
        this.elapsedTime = 0;
        this.cylceIndex = 0;
    }

    pause(){
        this.play = false;
    }

    update(dt){
        if (!this.isPlaying) {
            return;
        }

        this.SpriteSheet.flipY = false;
        this.SpriteSheet.flipX = false;

        this.elapsedTime += dt;

        if (this.elapsedTime >= this.frameDuration) {
            if (this.animationCycle) {
                this.cylceIndex++;
                if (this.cylceIndex >= this.animationCycle.length) {
                    this.cylceIndex = 0;
                }
                if(typeof this.options.flipArray[this.cylceIndex] === typeof 1){
                    if(this.options.flipArray[this.cylceIndex] === 1){
                        this.SpriteSheet.flipY = true;
                    } else if(this.options.flipArray[this.cylceIndex] === 2){
                        this.SpriteSheet.flipX = true
                    }
                }
                
                this.currentFrameIndex = this.animationCycle[this.cylceIndex];
            } else {
                this.currentFrameIndex++;
                if(this.options.maxFrame){
                    if (this.currentFrameIndex >= this.options.maxFrame) {
                        this.currentFrameIndex = 0;
                    }
                } else {
                    if (this.currentFrameIndex >= this.SpriteSheet.totalSprites) {
                        this.currentFrameIndex = 0;
                    }
                }
            }
      
            this.elapsedTime = 0;
        }
        
        this.SpriteSheet.setFrame(this.currentFrameIndex);
    }
}

const newAnimation = (SpriteSheet, frameDuration, anim, options) => {
    const nAnim = new Animation(SpriteSheet, frameDuration, anim, options);
    animations.push(nAnim);
    return nAnim;
}

w.newAnimation = newAnimation;

// END OF GRAPHICS

// IO:

window.on("keyDown", (a)=>{
    if(a.repeat === false){
        if(!keysDown.includes(e => e.key === a.key)){
            keysDown.push({
                key: a.key,
                scancode: a.scancode,
                options: {
                    capslock: a.capslock
                }
            });
        }

        if(typeof main.keyDown !== 'undefined' && main.keyDown instanceof Function){
            main.keyDown(a.key);
        }
    
        if(pluginsObj.plugins){
            pluginsObj.plugins.forEach((plg) => {
                if(typeof plg.keyDown !== 'undefined' && plg.keyDown instanceof Function){
                    plg.keyDown(a.key);
                }
            })
        }
    }
});

window.on("keyUp", (a)=>{
    let key = keysDown.find(e => e.key === a.key);
    if(key){
        const index = keysDown.indexOf(key);
        if (index > -1) {
            keysDown.splice(index, 1);
        }
    }

    if(typeof main.keyUp !== 'undefined' && main.keyUp instanceof Function){
        main.keyUp(a.key);
    }

    if(pluginsObj.plugins){
        pluginsObj.plugins.forEach((plg) => {
            if(typeof plg.keyUp !== 'undefined' && plg.keyUp instanceof Function){
                plg.keyUp(a.key);
            }
        })
    }
});

// NOTE: There maybe buttons that are at the sides fix if needed
window.on("mouseButtonDown", (a)=> {
    if(a.button === 1){
        mouseDown.left = true;
    } else if(a.button === 2){
        mouseDown.middle = true;
    } else if(a.button === 3){
        mouseDown.right = true;
    }

    mouseDown.x = a.x;
    mouseDown.y = a.y;

    if(typeof main.mousePressed !== 'undefined' && main.mousePressed instanceof Function){
        main.mousePressed(a.button, a.x, a.y);
    }

    if(pluginsObj.plugins){
        pluginsObj.plugins.forEach((plg) => {
            if(typeof plg.mousePressed !== 'undefined' && plg.mousePressed instanceof Function){
                plg.mousePressed(a.button, a.x, a.y);
            }
        })
    }
});

window.on("mouseButtonUp", (a)=> {
    if(a.button === 1){
        mouseDown.left = false;
    } else if(a.button === 2){
        mouseDown.middle = false;
    } else if(a.button === 3){
        mouseDown.right = false;
    }

    mouseDown.x = a.x;
    mouseDown.y = a.y;

    if(typeof main.mouseReleased !== 'undefined' && main.mouseReleased instanceof Function){
        main.mouseReleased(a.button, a.x, a.y);
    }

    if(pluginsObj.plugins){
        pluginsObj.plugins.forEach((plg) => {
            if(typeof plg.mouseReleased !== 'undefined' && plg.mouseReleased instanceof Function){
                plg.mouseReleased(a.button, a.x, a.y);
            }
        })
    }
});

window.on("mouseMove", (a)=> {
    if(typeof main.mouseMove !== 'undefined' && main.mouseMove instanceof Function){
        main.mouseMove(a.x, a.y);
    }

    if(pluginsObj.plugins){
        pluginsObj.plugins.forEach((plg) => {
            if(typeof plg.mouseMove !== 'undefined' && plg.mouseMove instanceof Function){
                plg.mouseMove(a.x, a.y);
            }
        });
    }
});

window.on("mouseWheel", (a)=> {
    if(typeof main.mouseWheel !== 'undefined' && main.mouseWheel instanceof Function){
        main.mouseWheel(a.x, a.y, a.dy);
    }
    
    if(pluginsObj.plugins){
        pluginsObj.plugins.forEach((plg) => {
            if(typeof plg.mouseWheel !== 'undefined' && plg.mouseWheel instanceof Function){
                main.mouseWheel(a.x, a.y, a.dy);
            }
        });
    }
});

w.io.isKeyDown = function(key){
    let keyF;
    if(typeof key === typeof "string") keyF = keysDown.find(e => e.key === key); else if(typeof key === typeof 1) keyF = keysDown.find(e => e.scancode === key);
    
    if(keyF){
        return true;
    } else {
        return false;
    }
}

w.io.isKeyUp = function(key){
    let keyF;
    if(typeof key === "string") keyF = keysDown.find(e => e.key === key); else if(typeof key === 1) keyF = keysDown.find(e => e.scancode === key);
    if(!keyF){
        return true;
    } else {
        return false;
    }
}

w.io.isMouseDown = function(button){
    if(typeof button === typeof 1 && button <= 3 && !(button <= 0)){
        if(button === 1 && mouseDown.left){
            return true;
        } else if(button === 2 && mouseDown.middle){
            return true;
        } else if(button === 3 && mouseDown.right){
            return true;
        } else {
            return false;
        }
    }
}

w.io.isMouseUp = function(button){
    if(typeof button === typeof 1 && button <= 3 && !(button <= 0)){
        if(button === 1 && mouseDown.left){
            return false;
        } else if(button === 2 && mouseDown.middle){
            return false;
        } else if(button === 3 && mouseDown.right){
            return false;
        } else {
            return true;
        }
    }   
} // i literally don't know why i added MouseUp

w.io.getMousePos = function(){
    return sdl.mouse.position;
}

// NOTE: i couldn't get rumbling work on my system.

function initJoystick(id, options){
    const joyst = sdl.joystick.devices.find(a => a.id === id);
    if(joyst){
        try{
            const contl = sdl.joystick.openDevice(joyst);
            const joysObj = {
                id: id,
                controller: contl,
                events: { ...options },
                led: contl.hasLed,
                rumble: contl.hasRumble
            }
            joysticks.push(joysObj);
            return joysObj;
        } catch(err){
            console.error(err)
            return false;
        }
    }
    return false;
}

function setupJosyticks(){
    if(joysticks){
        joysticks.forEach((joystick, val) => {
            joystick.controller.on("axisMotion", (axis, val) => {
                if(typeof joystick.events.axisMotion !== 'undefined' && joystick.events.axisMotion instanceof Function){
                    joystick.events.axisMotion(axis, val);
                }
            });
            joystick.controller.on("buttonDown", (button) => {
                if(typeof joystick.events.buttonDown !== 'undefined' && joystick.events.buttonDown instanceof Function){
                    joystick.events.buttonDown(button);
                }
            });
            joystick.controller.on("buttonUp", (button) => {
                if(typeof joystick.events.buttonUp !== 'undefined' && joystick.events.buttonUp instanceof Function){
                    joystick.events.buttonUp(button);
                }
            });
            joystick.controller.on("close", () => {
                if(typeof joystick.events.v !== 'undefined' && joystick.events.close instanceof Function){
                    joystick.events.close();
                }
            });
            joystick.controller.on("ballMotion", (ball, x, y) => {
                if(typeof joystick.events.ballMotion !== 'undefined' && joystick.events.ballMotion instanceof Function){
                    joystick.events.ballMotion(ball, x, y);
                }
            });
        });
    }
}

w.initJoystick = initJoystick;

w.io.playSound = function(soundPath, volume){
    if(soundPath.startsWith("./") || soundPath.startsWith("../") || soundPath.startsWith("/")){
        soundPath = path.join(process.cwd(), game.folder, soundPath);
    }

    playsound.play(soundPath, volume);
}

// END OF IO

// OBJECTS:

class GameObject {
    constructor(x, y, z, width, height, rot, options){
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
        this.rot = rot;
        this.options = options;
        this.update = this.options.update;
        this.render = this.options.render;
        this.willRender = true;

        gameObjects.push(this);
    }
    
    remove() {
        gameObjects = gameObjects.filter(item => item !== this);
    }

    hide(){
        this.willRender = false;
    }

    show(){
        this.willRender = true;
    }
}

w.GameObject = GameObject;

// END OF OBJECTS

pluginsObj.plugins.forEach(async (a) => {
    Object.entries(a.interface).forEach(([name, fn]) => {
        pluginsObj.pl[name] = fn;
    });
});

//GAMELOOP:

pluginsObj.plugins.forEach(async(pluginss) => {
    await pluginss.init(w, pluginsObj.kit);
});

await main.init(w, pluginsObj.pl);
setupJosyticks();

async function render(){
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.fillRect(0, 0, window.width, window.height);    
    ctx.stroke();
    
    if(game.config.enableWhiteByDefault){
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";
    };

    for (const gameObject of gameObjects) {
        if(gameObject.willRender){
            await gameObject.render(w, graphics, pluginsObj.pl);
        }
    }

	await main.draw(w, graphics, pluginsObj.pl);

	window.render(window.width, window.height, window.width*4, 'bgra32', canvas.toBuffer('raw'));
}

async function gameLoop(){
	var dt = 0;
	var current = 0;
	var lastRender = Date.now();
	while(!window.destroyed && game.isPlaying){
		current = Date.now(),
      	dt = (current - lastRender) / 1000;

        gameObjects.sort((a, b) => {
            if (a.z === b.z) {
              return a.id - b.id; // Sort by ID in case of ties
            }
            return a.z - b.z; // Sort by Z-axis
        });
        
        pluginsObj.plugins.forEach((plg) => {
            plg.loop(w, dt, pluginsObj.kit);
        });

        for (const gameObject of gameObjects) {
            await gameObject.update(w, dt, pluginsObj.pl);
        }

        animations.forEach((anim) => {
            anim.update(dt);
        });

        await main.loop(w, dt);

 		await render();

        await setTimeout(10);
        lastRender = current;
	}
}

await gameLoop();

// END OF GAMELOOP