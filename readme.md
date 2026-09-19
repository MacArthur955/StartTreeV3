# StartTreeV3

<img width="800" height="450" alt="output" src="https://github.com/user-attachments/assets/3ffbce64-1fcf-40f1-9ff0-1a54a8222732" />

## Installation

No installation. Just click [HERE](https://macarthur955.github.io/StartTreeV3/). \
I'm sure you'll manage that.

## Guides

### ✏️ Configuring

To enter edit mode, click on the cog icon in the top right corner.

### Adding elements

Click the (+) buttons to add new elements

### Editing elements

Click on elements you would like to edit

### Moving elements

Drag and drop elements you would like to move

### Saving your StartTree

Click on the top right check button to **copy** and **go** to your new URL.

### Keyboard navigation (view mode)

Use the arrow keys, `h`, `j`, `k`, `l`, or `Tab` to navigate between links.

### ⚙ Setting as default

Once you configured your StartTree and **copied** its URL, you can set it as your default browser page.

#### 🦊 Firefox

Set as **home page**: [Guide](https://support.mozilla.org/en-US/kb/how-to-set-the-home-page)

Set as **new-tab page**: Download the extension [New Tab Override](https://addons.mozilla.org/de/firefox/addon/new-tab-override/) and set it as "custom url"

#### 🔴 Chrome

Set as **home page**: [Guide](https://support.google.com/chrome/answer/95314?hl=en&co=GENIE.Platform%3DAndroid)

Set as **new-tab page**: Download the extension [Change new tab](https://chrome.google.com/webstore/detail/change-new-tab/mocklpfdimiadpbgamlgehpgpodggahe?hl=de) and set it as "URL  address"

#### 🧭 Safari

Set as **home/new-tab page**: [Guide](https://support.apple.com/de-de/guide/safari/ibrw1020/mac)


## Development

To do the thing you will need a few dependencies:
* [Node.js](https://nodejs.org/en/download)
* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* [just](https://just.systems/man/en/installation.html)

if you have those, you can now run
```bash
just init
```
to install the rest of the project dependencies.
There are a few other commands available:

| Command | Purpose |
| --- | --- |
| `just` | display the command list |
| `just init` | Install project dependencies |
| `just style` | Check formatting and lint rules with Biome |
| `just build` | Check TypeScript types and build the site in `dist/` |
| `just run` | Build and serve locally at `http://localhost:8000/` using Node.js |


## Credits

StartTreeV3 is based on [StartTreeV2](https://github.com/AlexW00/StartTreeV2).
Alexander's Weichart project which I customized a bit.

How StartTreeV3 differs from StartTreeV2:

* Keyboard navigation
* Url shortening
* No search engine
