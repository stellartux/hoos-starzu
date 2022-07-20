function getName() {
  return 'Z5-SIMPL'
}

/** @type {Record<string,any>} */
let state

/** @type {Record<string,{ onConnect: () => void, onUpdate: () => void, onInput: (key: number) => void }>} */
const scenes = {
  index: {
    onConnect: function () {
    },
    onUpdate: function () {
    },
    onInput: function (key) {
    }
  },
}

let currentScene
function switchToScene(scene) {
  state = {}
  currentScene = scene
  if (currentScene.onConnect) currentScene.onConnect()
  onUpdate = currentScene.onUpdate
  onInput = currentScene.onInput
}
function onConnect() { switchToScene(scenes.index) }
function onInput() { }
function onUpdate() { }
