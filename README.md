<p align="center">
    <img src="https://media.discordapp.net/attachments/1115350451014090885/1121833553089544282/q_3.png?width=400&height=100" alt>
    <br>
    <sub><b>✨A Tiny Javascript Game Engine</b></sub>
</p>

<div align="center">

[Getting Started](#start) | [Documentation](#docs) | [Help](#help)
</div>

<div id="start">
        
## **🎁Getting Started:**
**Qngine** is a very simple Game Engine I built for Javascript. It is highly inspired from [**LÖVE**](https://love2d.org/). It's also my first game engine.
### **Installing:**
Simply clone this repository with:
```
git clone https://github.com/QwertyR0/Qngine.git Qngine
```

and in the file **Qngine** run the command below to download the dependencies:
```bash
npm i
```
</br>

### **Running the Demo:**
Simply run the command below:
```bash
node PATH_TO_THE_QNGINE_FOLDER/src/engine.js demoGame/
```
</br>

### **Making The First Program:**

**1.** Create a game folder and also create a **config.json** and a **main.js**

**2.** Write this json below to your **config.json**
```json
{
    "title": "TestGame",
    "gameFile": "./main.js",
    "enableWhiteByDefault": true
}
```

The **"title"** will be the window title of your game and the **"gameFile"** will the main gamefile you created as **main.js**.

**3.** Write this Javascript code below to your **main.js**
```js

export async function init(w, pl){
}

export function loop(w, dt, pl){
}

export function draw(w, graphics){
    graphics.text("Hello World!", 0, 0);
}
```

**4.** Finally run it with the command:
```bash
node PATH_TO_THE_QNGINE_FOLDER/src/engine.js PATH_TO_THE_GAME_FOLDER
```

Don't forget to replace these **PATH_TO_THE_QNGINE_FOLDER** and **PATH_TO_THE_GAME_FOLDER** placeholders.

#### NOTE:
I only tested this on node v20.2.0

Qngine is still in development and you should expect bugs(like a lot).

</div>
<br>
<div id="docs">

## **Documentation:**

Click [here](https://github.com/QwertyR0/Qngine/wiki) for the wiki.  
Beaware that only %38.6 of the wiki is done.

</div>

<div id="help">

### **For Help:**

You can open an issue on github or just DM me on Discord.

My Discord: **qwerty.r0**

My Website: **[https://qwertyr0.is-a.dev/](https://qwertyr0.is-a.dev/)**

</div>

### **Special Thanks to:**
- **[kmamal](https://github.com/kmamal)** For making SDL bindings for node.js.
- **[Blendi Goose](https://github.com/lieve-blendi)** For minorly testing and helping with some issues.
- **[kTheLemon](https://github.com/kTheLemon)** For minorly testing Qngine.
- **farukk9326** For making the icon.
