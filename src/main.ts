import "./style.css"

const settingsModal = document.getElementById("settings-modal")!
const text = document.getElementById("mainText")!

const scrollButton = document.getElementById("scroll")!
const topButton = document.getElementById("top")!
const duration = document.getElementById("duration") as HTMLInputElement
const mediaHook = document.getElementById("mediaHook") as HTMLAudioElement
const speedElem = document.getElementById("speed")!
const settingsButton = document.getElementById("settings")!

const enableMediaControlElem = document.getElementById(
  "mediaControlSetting"
) as HTMLInputElement

settingsButton.addEventListener("click", () => {
  settingsModal.classList.toggle("hidden")
})

document.getElementById("closeSettings")!.addEventListener("click", () => {
  settingsModal.classList.toggle("hidden")
})

topButton.addEventListener("click", () => {
  setScrollPercentage(0)
})
;(document.getElementById("flipText") as HTMLInputElement)!.addEventListener(
  "change",
  (e) => {
    text.classList.toggle("flipped", (e.target as HTMLInputElement)!.checked)
    flipped = !flipped
  }
)

let enableMediaControl = localStorage.getItem("enableMediaControl") === "true"

enableMediaControlElem.checked = enableMediaControl

enableMediaControlElem!.addEventListener("change", (e) => {
  enableMediaControl = (e.target as HTMLInputElement)!.checked
  localStorage.setItem("enableMediaControl", `${enableMediaControl}`)
  if (!enableMediaControl) {
    mediaHook.pause()
    navigator.mediaSession.playbackState = "none"
  }
})

let targetDuration = 20

document.getElementById("faster")!.addEventListener("click", () => {
  targetDuration += 5
  updateTargetDuration()
})

document.getElementById("slower")!.addEventListener("click", () => {
  targetDuration = Math.max(5, targetDuration - 5)
  updateTargetDuration()
})

function updateTargetDuration() {
  duration.value = `${targetDuration}`
}

let playing = false
let startTime = Date.now()
let startPercent = 0
let flipped = false

function play() {
  if (enableMediaControl) {
    mediaHook.play()
    navigator.mediaSession.playbackState = "playing"
  }
  scrollButton.textContent = "⏸︎"
  scrollButton.classList.add("playing")
  topButton.classList.add("hidden")
  speedElem.classList.add("hidden")
  settingsButton.classList.add("hidden")
  playing = true
  startScrolling()
}

function pause() {
  if (enableMediaControl) {
    mediaHook.pause()
    navigator.mediaSession.playbackState = "paused"
  }
  scrollButton.textContent = "▶︎"
  scrollButton.classList.remove("playing")
  topButton.classList.remove("hidden")
  speedElem.classList.remove("hidden")
  settingsButton.classList.remove("hidden")
  playing = false
}

scrollButton.addEventListener("click", togglePlaying)

window.addEventListener(
  "wheel",
  () => {
    console.log("shmoving")
    if (playing) pause()
  },
  { passive: true }
)

document.documentElement.addEventListener(
  "touchstart",
  () => {
    if (playing) pause()
  },
  { passive: true }
)

function togglePlaying() {
  console.log("!")
  if (playing) {
    pause()
  } else {
    play()
  }
}

function startScrolling() {
  startTime = Date.now()
  startPercent = calcCurrentPercentage()
  console.log(startPercent)
  requestAnimationFrame(scrollFrame)
}

function clamp(number: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, number))
}

function scrollFrame() {
  if (!playing) return

  let timeElapsed = (Date.now() - startTime) / 1000

  let targetPercent = startPercent + timeElapsed / targetDuration

  let clamped = clamp(targetPercent, 0, 1)
  setScrollPercentage(clamped)

  if (targetPercent >= 1) {
    pause()
    return
  }
  requestAnimationFrame(scrollFrame)
}

function calcCurrentPercentage() {
  const elem = document.scrollingElement!
  const percentage = elem.scrollTop / (elem.scrollHeight - elem.clientHeight)
  return flipped ? 1 - percentage : percentage
}

function setScrollPercentage(percentage: number) {
  const elem = document.scrollingElement!
  const realPercentage = flipped ? 1 - percentage : percentage
  const targetScroll = realPercentage * (elem.scrollHeight - elem.clientHeight)
  elem.scrollTop = targetScroll
}

mediaHook.addEventListener("play", () => {
  navigator.mediaSession.playbackState = "playing"
  navigator.mediaSession.metadata = new MediaMetadata({
    title: "Test Audio!",
  })
})

mediaHook.addEventListener("pause", () => {
  navigator.mediaSession.playbackState = "paused"
})

navigator.mediaSession.setActionHandler("play", togglePlaying)

navigator.mediaSession.setActionHandler("previoustrack", () => {
  if (playing) {
    pause()
  }
  setScrollPercentage(0)
})
navigator.mediaSession.setActionHandler("pause", togglePlaying)

text.addEventListener("paste", function (e) {
  e.preventDefault()
  var text = e.clipboardData!.getData("text/plain")
  document.execCommand("insertHTML", false, text)
})
