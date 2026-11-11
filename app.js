const stages = [...document.querySelectorAll("[data-stage]")];
const progressSteps = [...document.querySelectorAll(".progress li")];
const anger = document.querySelector("#anger");
const angerValue = document.querySelector("#anger-value");
const meter = document.querySelector("#meter-control");
const face = document.querySelector("#face");
const cloud = document.querySelector("#apology-cloud");

const apologies = [
  "im sorryyyy",
  "im so sorry pls forgive me",
  "ainda nae kroonga",
  "meri ghalti thi",
  "i fucked up",
  "sorry hadia :(",
];

// Desktop x/y and mobile x/y. Keep the middle clear for the apology heading.
const stickerPositions = [
  [23, 13, 24, 10],
  [72, 20, 74, 25],
  [21, 76, 26, 74],
  [77, 84, 73, 90],
  [12, 36, 71, 12],
  [88, 60, 28, 88],
  [52, 10, 45, 34],
  [41, 91, 72, 76],
  [51, 25, 27, 22],
  [57, 77, 50, 65],
  [89, 31, 50, 4],
  [10, 64, 50, 94],
];

let apologyTimer;

function showStage(name) {
  const index = stages.findIndex((stage) => stage.dataset.stage === name);

  stages.forEach((stage, stageIndex) => {
    stage.hidden = stageIndex !== index;
    progressSteps[stageIndex].classList.toggle("is-complete", stageIndex < index);
    progressSteps[stageIndex].removeAttribute("aria-current");
  });

  progressSteps[index].setAttribute("aria-current", "step");
  stages[index].querySelector(".title").focus({ preventScroll: true });
}

function updateAnger() {
  const value = anger.valueAsNumber;
  meter.style.setProperty("--anger", value);
  angerValue.firstChild.textContent = value;
  anger.setAttribute("aria-valuetext", `${value} out of 100`);
  face.dataset.expression = value >= 70 ? "furious" : value >= 30 ? "angry" : "calm";
}

function finishApology() {
  window.clearTimeout(apologyTimer);
  cloud.replaceChildren();
  showStage("ending");
}

function startApology() {
  const intensity = anger.valueAsNumber / 100;
  const count = 6 + Math.round(intensity * 54);
  const stagger = Math.round(220 - intensity * 150);
  // Let each sticker finish before the next one reaches the same position.
  const lifetime = Math.round(1700 - intensity * 880);
  const stickers = document.createDocumentFragment();

  for (let index = 0; index < count; index += 1) {
    const slot = index % stickerPositions.length;
    const wave = Math.floor(index / stickerPositions.length);
    const [x, y, mobileX, mobileY] = stickerPositions[slot];
    const delay = index * stagger;
    const sticker = document.createElement("span");
    sticker.className = "apology-sticker";
    sticker.textContent = apologies[(index + wave) % apologies.length];
    sticker.style.setProperty("--left", `${x}%`);
    sticker.style.setProperty("--top", `${y}%`);
    sticker.style.setProperty("--mobile-left", `${mobileX}%`);
    sticker.style.setProperty("--mobile-top", `${mobileY}%`);
    sticker.style.setProperty("--delay", `${delay}ms`);
    sticker.style.setProperty("--tilt", `${index % 2 === 0 ? -8 : 7}deg`);
    sticker.style.setProperty("--drift", `${index % 2 === 0 ? 18 : -18}px`);
    stickers.append(sticker);
  }

  cloud.style.setProperty("--lifetime", `${lifetime}ms`);
  cloud.replaceChildren(stickers);
  showStage("apology");
  const endTime = (count - 1) * stagger + lifetime;
  apologyTimer = window.setTimeout(finishApology, endTime + 450);
}

document.querySelector("#proceed").addEventListener("click", () => showStage("meter"));
anger.addEventListener("input", updateAnger);
document.querySelector("#apologize").addEventListener("click", startApology);
document.querySelector("#skip").addEventListener("click", finishApology);
document.querySelector("#replay").addEventListener("click", () => {
  anger.value = 0;
  updateAnger();
  showStage("intro");
});

updateAnger();
