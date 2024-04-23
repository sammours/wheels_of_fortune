const canvas = document.querySelector("#canvas");

let canvasOptions = {
  separation: 40,
  color: "#a1a1a1",
  width: window.innerWidth,
  height: window.innerHeight,
  margin: {
    left: 20,
    top: 20,
  },
};

const colours = ["#ccaa77", "#77aacc", "#7777cc", "#aaaacc", "#aa77cc", "#aacc77", "#ccaaaa", "#bbdddd"];
const slices = [];

const defaultPosition = 5;
const maxInputs = 12;

let isSpinning = false;
let spinningRandomPosition = 0;
let spinningCounter = 0;
let repeater;

function spin() {
  spinningRandomPosition = Math.floor(Math.random() * slices.length) + 1;
  isSpinning = true;
  repeater = setInterval(repeatSpinning, 50);
}

function repeatSpinning() {
  drawWheel((spinningCounter + 5) * (spinningRandomPosition));

  if (spinningCounter === 10) {
    clearInterval(repeater);
    repeater = setInterval(repeatSpinning, 100);
  }

  if (spinningCounter === 20) {
    clearInterval(repeater);
    repeater = setInterval(repeatSpinning, 200);
  }

  if (spinningCounter === 23) {
    clearInterval(repeater);
    repeater = setInterval(repeatSpinning, 500);
  }

  if (spinningCounter === 26) {
    clearInterval(repeater);
    spinningCounter = 0;
    isSpinning = false;
    drawWheel(spinningCounter + 5 * (spinningRandomPosition));
    return;
  }

  spinningCounter += 1;
}

function init() {
  canvas.width = 600;
  canvas.height = 600;

  initializeSlices();
  createDefaultInputs();
  drawWheel(defaultPosition);
}

function drawWheel(rotation) {
  const ctx = getCtx();
  var centerX = (canvas.width - 50) / 2;
  var centerY = (canvas.height - 50) / 2;
  var radius = (canvas.height - 100) / 2;

  drawTriangle(ctx);

  let startAngle = rotation;
  let angleSize = (2 * Math.PI) / slices.length;
  for (let i = 0; i < slices.length; i++) {
    if (isSpined() && isSliceSelected(centerX, startAngle, angleSize) && !isSpinning) {
        setSelectedValue(slices[i].text, slices[i].colour);
    } 
    drawSlice(ctx, centerX, centerY, radius, startAngle, angleSize + startAngle, slices[i].colour);
    drawText(ctx, centerX, startAngle + angleSize / 2, slices[i].text);
    startAngle = startAngle + angleSize;
  }
}

function drawText(ctx, center, angle, text) {
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(angle);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  let fontSize = '30px';
  if (text.length > 15) {
      fontSize = '20px';
  }
  ctx.font = 'bold ' + fontSize + ' sans-serif';
  ctx.fillText(text, center / 2, 10);
  ctx.restore();
}

function drawSlice(ctx, centerX, centerY, radius, startAngle, angleSize, colour) {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, angleSize, false);
  ctx.lineTo(centerX, centerY);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, angleSize, false);
  ctx.strokeStyle = lightenDarkenColor(colour, 20);
  ctx.lineWidth = 20;
  ctx.stroke();
}

function drawTriangle(ctx) {
  ctx.beginPath();
  ctx.moveTo(550, 275);
  ctx.lineTo(575, 300);
  ctx.lineTo(575, 250);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function getCtx() {
  const ctx = canvas.getContext("2d");

  ctx.strokeStyle = canvasOptions.color;
  ctx.lineWidth = 2;
  return ctx;
}

function initializeSlices() {
  slices.push({ text: "Default 1", colour: colours[0] });
  slices.push({ text: "Default 2", colour: colours[1] });
  slices.push({ text: "Default 3", colour: colours[2] });
  slices.push({ text: "Default 4", colour: colours[3] });
  slices.push({ text: "Default 5", colour: colours[4] });
  slices.push({ text: "Default 6", colour: colours[5] });
  slices.push({ text: "Default 7", colour: colours[6] });
  slices.push({ text: "Default 8", colour: colours[7] });
}

function rad2deg(deg) {
  return deg * (180 / Math.PI);
}

function lightenDarkenColor(col, amount) {
  let usePound = false;
  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  let num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  if (r > 255) {
    r = 255;
  } else if (r < 0) {
    r = 0;
  }

  let b = ((num >> 8) & 0x00ff) + amount;

  if (b > 255) {
    b = 255;
  } else if (b < 0) {
    b = 0;
  }

  let g = (num & 0x0000ff) + amount;

  if (g > 255) {
    g = 255;
  } else if (g < 0) {
    g = 0;
  }

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function createDefaultInputs() {
  const container = document.getElementById("settings-container");
  for (let i = 0; i < slices.length; i++) {
    createInputElement(container, slices[i].text, "choice", i);
    createInputElement(container, slices[i].colour, "colour", i);
  }
}

function createNewChoice() {
  const container = document.getElementById("settings-container");
  const index = slices.length;
  if (index >= maxInputs) {
    return;
  }

  const defaultText = "Default " + (index + 1);
  const defaultColour = colours[(index + 1) % colours.length];
  slices.push({ text: defaultText, colour: defaultColour });
  createInputElement(container, defaultText, "choice", index);
  createInputElement(container, defaultColour, "colour", index);
  drawWheel(defaultPosition);
}

function createInputElement(container, text, type, i) {
  let choiceInput = document.createElement("input");
  choiceInput.type = "text";
  choiceInput.value = text;
  choiceInput.classList = "input " + type + "-input";
  choiceInput.placeholder = "Text";
  choiceInput.id = type + i;
  choiceInput.name = type + i;
  if (type === "choice") {
    choiceInput.addEventListener("input", onChoiceInputClicked);
  } else {
    choiceInput.addEventListener("input", onColourInputClicked);
  }

  container.appendChild(choiceInput);
}

function onChoiceInputClicked(e) {
  if (e == null || e.target == null) {
    return;
  }

  const index = e.target.id.replace("choice", "");
  if (e.target.value.length > 25) {
    return;
  }

  slices[parseInt(index, 10)].text = e.target.value;
  drawWheel(defaultPosition);
}

function onColourInputClicked(e) {
  if (e == null || e.target == null) {
    return;
  }

  const index = e.target.id.replace("colour", "");
  if (!/^#([A-Fa-f0-9]{6})$/.test(e.target.value)) {
    return;
  }

  slices[parseInt(index, 10)].colour = e.target.value;
  drawWheel(defaultPosition);
}

function isSliceSelected(center, startAngle, angleSize) {
    return (rad2deg(startAngle) % 360) >= center && (rad2deg(angleSize) % 360) <= center;
}

function isSpined() {
    return spinningRandomPosition !== 0;
}

function setSelectedValue(text, colour) {
    const container = document.getElementById('selectedValue');
    container.style.color = colour;
    container.innerHTML = text;
}