const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 800; // Set the canvas width in pixels
const canvasHeight = 600; // Set the canvas height in pixels
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let color = "#000000";
let lineWidth = 5;
ctx.strokeStyle = color;
ctx.lineWidth = lineWidth;

const colorPicker = document.getElementById("color-picker");
colorPicker.addEventListener("input", (event) => {
    color = event.target.value;
    ctx.strokeStyle = color;
});

const clearButton = document.getElementById("clear-button");
clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let isPanning = false;
let offsetX = 0;
let offsetY = 0;
let scale = 1; // Initialize the scale factor
let translateX = 0; // Initialize the horizontal translation
let translateY = 0; // Initialize the vertical translation
let initialX = 0; // Store initial X coordinate for panning
let initialY = 0; // Store initial Y coordinate for panning

let recenter = false;

let onzoomEvent = (event) => {
    const rect = canvas.getBoundingClientRect();
    let newScale, offsetXBefore, offsetXAfter, offsetYBefore, offsetYAfter;

    // Calculate the new scale value based on the scroll direction
    if(event) {
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        newScale = Math.min(Math.max(0.1, scale + delta), 3);
    }
   
    if(!event || recenter || newScale < 1) {
        newScale = 1;
        translateX = 0;
        translateY = 0;
        offsetXBefore = 0;
        offsetYBefore = 0;
        offsetXAfter = 0;
        offsetYAfter = 0;
        recenter = false;
    } else {
    // Calculate the mouse position relative to the canvas before scaling
        offsetXBefore = (event.clientX - rect.left) / scale - translateX;
        offsetYBefore = (event.clientY - rect.top) / scale - translateY;

    // Calculate the mouse position relative to the canvas after scaling
        offsetXAfter = (event.clientX - rect.left) / newScale - translateX;
        offsetYAfter = (event.clientY - rect.top) / newScale - translateY;
    }
    // Adjust the translation to maintain the zooming point
    translateX += offsetXBefore - offsetXAfter;
    translateY += offsetYBefore - offsetYAfter;

    // Apply the new transform with both scale and translation
    canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${newScale})`;

    // Update the scale variable for future calculations
    scale = newScale;
}


const recenterButton = document.getElementById("recenter-button");
recenterButton.addEventListener("click", () => {
    recenter = true;
    onzoomEvent();
});

const zoomRange = document.getElementById("zoom-range");
zoomRange.addEventListener("input", (event) => {
    const scale = parseFloat(event.target.value);
    canvas.style.transform = `scale(${scale})`;
});

canvas.parentElement.addEventListener("wheel", (event) => {
    event.preventDefault();
    onzoomEvent(event);
});

canvas.addEventListener("mousedown", (event) => {
    // Check if the middle mouse button is pressed or the Alt key is held down
    if (event.button === 1 || event.altKey) {
    } else {
        [lastX, lastY] = [event.offsetX * (canvasWidth / canvas.clientWidth), event.offsetY * (canvasHeight / canvas.clientHeight)];
    }
});

let drawPixel = (event) => {
    ctx.fillRect(
        event.offsetX * (canvasWidth / canvas.clientWidth) - lineWidth / 2, 
        event.offsetY * (canvasHeight / canvas.clientHeight) - lineWidth / 2, 
        lineWidth, 
        lineWidth
    );
}

canvas.parentElement.addEventListener("mousedown", (event) => {
    // Check if the middle mouse button is pressed or the Alt key is held down
    if (event.button === 1 || event.altKey) {
        isPanning = true;
        initialX = event.clientX - translateX;
        initialY = event.clientY - translateY;
        canvas.parentElement.style.cursor = "move";
    } else {
        isDrawing = true;
        if (isLineDrawingMode) { //need to move to trigger lines
        } else {
            // Pixel drawing mode
            ctx.fillStyle = color; // Set fill style to the selected color
            //twice because it grays out on first draw for some reason
            drawPixel(event);
            drawPixel(event);
            drawPixel(event);
        }
    }

    
});

canvas.addEventListener("mousemove", (event) => {
    if (isDrawing) {
        draw(event);
    }
});

canvas.parentElement.addEventListener("mousemove", (event) => {
    if (isPanning) {
        if (event.clientX - initialX !== 0 || event.clientY - initialY !== 0) {
            translateX = event.clientX - initialX;
            translateY = event.clientY - initialY;
            canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        }
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    lastX = undefined; lastY = undefined;
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false;
});

canvas.parentElement.addEventListener("mouseup", () => {
    isPanning = false;
    canvas.parentElement.style.cursor = "default";
});

canvas.parentElement.addEventListener("mouseout", () => {
    isPanning = false;
});


let isLineDrawingMode = true; // Flag for line drawing mode
let lineWidthLabel = document.getElementById('line-label');
let lineWidthInput = document.getElementById("line-width"); // Line width input element

// Event listener for the line mode toggle button
const toggleModeButton = document.getElementById("toggle-mode-button");
toggleModeButton.addEventListener("click", () => {
    isLineDrawingMode = !isLineDrawingMode; // Toggle line drawing mode
    if (isLineDrawingMode) {
        toggleModeButton.innerHTML = "Line Mode";
        lineWidthLabel.innerHTML = "Line Width:";
        cursorStyle = "crosshair"; // Set cursor to crosshair in line drawing mode
    } else {
        toggleModeButton.innerHTML = "Pixel Mode";
        lineWidthLabel.innerHTML = "Pixel Size:";
        cursorStyle = "default"; // Set cursor to default in pixel drawing mode
    }
    canvas.style.cursor = cursorStyle;
});

// Event listener for line width input
lineWidthInput.addEventListener("input", (event) => {
    lineWidth = parseInt(event.target.value); // Update line width based on user input
    ctx.lineWidth = lineWidth; // Apply the new line width to the context
});

function draw(event) {
    if (isLineDrawingMode) {
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(
            typeof lastX === 'number' ? lastX : event.offsetX * (canvasWidth / canvas.clientWidth), 
            typeof lastY === 'number' ? lastY : event.offsetY * (canvasHeight / canvas.clientHeight)
        );
        ctx.lineTo(event.offsetX * (canvasWidth / canvas.clientWidth), event.offsetY * (canvasHeight / canvas.clientHeight));
        ctx.stroke();
        [lastX, lastY] = [event.offsetX * (canvasWidth / canvas.clientWidth), event.offsetY * (canvasHeight / canvas.clientHeight)];
    } else {
        // Pixel drawing mode
        ctx.fillStyle = color;
        drawPixel(event);
    }
}
