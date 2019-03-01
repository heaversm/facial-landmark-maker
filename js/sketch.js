let data = {}; // Global object to hold results from the loadJSON call
let shapes = []; // Global array to hold all shape arrays of coords
let mousePressedCoords = [];
let mouseReleasedCoords = [];
let isMousePressed = false;
let marqueeIsActive = false; //true when shift key selected
let closestShapeIndex;
let closestCoordIndex;
let mouseMovedX, mouseMovedY, mouseStartX, mouseStartY;
let selectedPoints = [];

let ww = 256;
let wh = 256;
let sfX, sfY;
let imgWidth, imgHeight;

let cGreen,cBlue,cRed;

let c; //canvas
let img;
let imgName = '002.png';
let fileName = imgName.substring(0, imgName.indexOf('.')) + '.txt';
let writer;

let instructionsAreVisible = true;

let $closeButton = document.querySelector('.close');
let $instructions = document.querySelector('.instructions');
let $colors = document.querySelectorAll('.color');
let $saveButton = document.querySelector('.save-btn');
let $loadButton = document.querySelector('.load-btn');
let $fileInput = document.querySelector('.file-input');
let activeColor, secondaryColor, highlightedColor;

function preload() {
  data = loadJSON('assets/face-points.json');
  let urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('image')){
    minimizeInstructions();
    imgName = urlParams.get('image');
    fileName = imgName.substring(0, imgName.indexOf('.')) + '.txt';
  }
  img = loadImage(`assets/${imgName}`); // Load the image
}

function drawPointsInitial() {
  //draw initial face landmarks
  let shapesData = data['shapes'];
  for (let i = 0; i < shapesData.length; i++) {
    // Get each object in the array
    let shapeData = shapesData[i];
    let shapeArr = [];

    for (let j = 0; j < shapeData.points.length; j++) {
      let position = shapeData.points[j];
      position.isSelected = false; //for marquee selection
      let posX = map(position.x,0,ww,0,ww*sfX);
      let posY = map(position.y,0,wh,0,wh*sfY);
      let posArr = [posX,posY];
      shapeArr.push(posArr);
    }
    
    shapes.push(shapeArr);

  }

}

function setup() {
  writer = createWriter(fileName);
  imgWidth = img.width;
  imgHeight = img.height;
  c = createCanvas(imgWidth, imgHeight);
  sfX = imgWidth/ww;
  sfY = imgHeight/wh;
  cGreen = color(123,255,0);
  cBlue = color(0,255,255);
  cRed = color(255,64,255);
  cYellow = color(255,237,0);
  activeColor = cGreen;
  secondaryColor = cRed;
  highlightedColor = cYellow;
  background(0);
  noSmooth();
  noFill();
  stroke(activeColor);
  drawPointsInitial();
  $closeButton.addEventListener('click',onCloseClick);
  $saveButton.addEventListener('click',handlePrintLandmarks);
  $loadButton.addEventListener('click',handleLoadImage);
  

  $colors.forEach((el)=>{
    el.addEventListener('click',()=>{
      handleColorChange(el.dataset.id);
    });
  })
}

function handleLoadImage(){
  const fileToLoad = $fileInput.value;
  let urlToLoad = `http://${window.location.host}?image=${fileToLoad}`;
  window.location.href = urlToLoad;
}

function handleColorChange(color){
  switch(color){
    case 'green':
      activeColor = cGreen;
      secondaryColor = cRed;
      break;
    case 'blue':
      activeColor = cBlue;
      secondaryColor = cRed;
      break;
    case 'red':
      activeColor = cRed;
      secondaryColor = cGreen;
      break;
  }
}

function onCloseClick(){
  if (instructionsAreVisible){
    minimizeInstructions();
  } else {
    maximizeInstructions();
  }
}

function minimizeInstructions(){
  $instructions.classList.add('hide');
  instructionsAreVisible = false;
  $closeButton.innerHTML = 'i'
}

function maximizeInstructions(){
  $instructions.classList.remove('hide');
  instructionsAreVisible = true;
  $closeButton.innerHTML = '-'
}

function mousePressed() {
  if (!isMousePressed){
    handleMousePressed();
    mousePressedCoords[0] = mouseX;
    mousePressedCoords[1] = mouseY;
    let smallestDist = 1000; //start arbitrarily high
    for (let i = 0; i < shapes.length; i++) {
      let curShape = shapes[i];
      for (let j=0; j<curShape.length;j++){
        
        let curCoord = curShape[j];
        
        let curDist = dist(mouseX, mouseY, curCoord[0], curCoord[1]);
        if (curDist < smallestDist){
          smallestDist = curDist;
          closestShapeIndex = i;
          closestCoordIndex = j;
        }
      }
    }
  }
  
}

function handleMousePressed(){
  isMousePressed = true;
  mouseStartX = mouseX;
  mouseStartY = mouseY;
  select('body').addClass('mousePressed');
  if (keyIsDown(SHIFT)){
    marqueeIsActive = true;
  }
}

function mouseReleased() {
  handleMouseReleased();
}

function handleMouseReleased(){
  select('body').removeClass('mousePressed');
  isMousePressed = false;
  mouseMovedX = 0;
  mouseMovedY = 0;
  if (mouseX == mouseStartX && mouseStartY == mouseY && !keyIsDown(SHIFT)){ //clicking without moving, clear marquee
    clearSelectedPoints();
  }
}

function clearSelectedPoints(){
  let shapesData = data['shapes'];
  for (let i = 0; i < shapes.length; i++) {
    let shapeData = shapesData[i];
    let shapeArrData = shapes[i];
    for (let j = 0; j < shapeArrData.length; j++) {
      let posArr = shapeArrData[j];
      let position = shapeData.points[j];
      position.isSelected = false;
    }
  }
  selectedPoints = [];
  marqueeIsActive = false;
}

function keyTyped() {
  if (key === 's') {
    handlePrintLandmarks();
  }
}

function handlePrintLandmarks(){

  for (let i = 0; i < shapes.length; i++) {
    // Get each object in the array
    let shapeArrData = shapes[i];
    
    for (let j = 0; j < shapeArrData.length; j++) {
      let posArr = shapeArrData[j];
      writer.print(`${posArr[0]} ${posArr[1]}`)
    }
  }
  writer.close();
  writer.clear();

}

function moveClosestPoint(){
  if (mouseX > 0 && mouseX < imgWidth && mouseY > 0 && mouseY < imgHeight){
    shapes[closestShapeIndex][closestCoordIndex][0] = mouseX;
    shapes[closestShapeIndex][closestCoordIndex][1] = mouseY;
  } else {
    handleMouseReleased();
    return;
  }
}

function moveMultiplePoints(){
  mouseMovedX = mouseX - mouseStartX;
  mouseMovedY = mouseY-mouseStartY;
  for (let i = 0; i < selectedPoints.length; i++) {
    let thisPoint = selectedPoints[i];
    thisPoint[0] = thisPoint[0] + mouseMovedX;
    thisPoint[1] = thisPoint[1] + mouseMovedY;
  }
  mouseStartX = mouseX;
  mouseStartY = mouseY;

}

function selectMultiplePoints(){
  
  mouseMovedX = mouseX - mouseStartX;
  mouseMovedY = mouseY-mouseStartY;

  let mouseEndX = mouseX;
  let mouseEndY = mouseY;

  for (let i = 0; i < shapes.length; i++) {
    let shapesData = data['shapes'];
    let shapeData = shapesData[i];
    let shapeArrData = shapes[i];
    for (let j = 0; j < shapeArrData.length; j++) {
      let posArr = shapeArrData[j];
      let position = shapeData.points[j];

      let isInBounds = false;

      if (mouseMovedX > 0 && mouseMovedY > 0){
        if (posArr[0] > mouseStartX && posArr[0] < mouseEndX && posArr[1] > mouseStartY && posArr[1] < mouseEndY){
          isInBounds = true;
        }
      } else if (mouseMovedX < 0 && mouseMovedY > 0){
        if (posArr[0] < mouseStartX && posArr[0] > mouseEndX && posArr[1] > mouseStartY && posArr[1] < mouseEndY){
          isInBounds = true;
        }
      } else if (mouseMovedX > 0 && mouseMovedY < 0){
        if (posArr[0] > mouseStartX && posArr[0] < mouseEndX && posArr[1] < mouseStartY && posArr[1] > mouseEndY){
          isInBounds = true;
        }
      } else if (mouseMovedX < 0 && mouseMovedY < 0){
        if (posArr[0] < mouseStartX && posArr[0] > mouseEndX && posArr[1] < mouseStartY && posArr[1] > mouseEndY){
          isInBounds = true;
        }
      }
      if (!position.isSelected && isInBounds){
        position.isSelected = true;
        selectedPoints.push(posArr);
      }
    }
  }
  stroke(255,255,255);
  fill(255,255,255,50);
  rect(mouseStartX, mouseStartY, mouseMovedX, mouseMovedY);
}

function draw() {
  background(0);
  image(img, 0, 0);
  if (isMousePressed){
    if (keyIsDown(SHIFT)){
      //marqueeIsActive = true;
      selectMultiplePoints();
    } else {
      if (!marqueeIsActive){
        moveClosestPoint();
      } else if (marqueeIsActive && selectedPoints.length) { //marquee is active
        moveMultiplePoints();
      }
    }
  }
  
  let shapesData = data['shapes'];
  
  for (let i = 0; i < shapes.length; i++) {
    // Get each object in the array
    let shapeData = shapesData[i];
    let shapeArrData = shapes[i];
    
    beginShape();
    noFill();
    stroke(activeColor);
    for (let j = 0; j < shapeArrData.length; j++) {
      let posArr = shapeArrData[j];
      vertex(posArr[0],posArr[1]);
    }

    if (shapeData.shapeName == "nose"){
      vertex(shapeArrData[3][0],shapeArrData[3][1]); //draw a point back to center of nose for looks
    }
    shapeData.doCloseShape ? endShape(CLOSE) : endShape();

    for (let j = 0; j < shapeArrData.length; j++) {
      let posArr = shapeArrData[j];
      let position = shapeData.points[j];
      stroke(position.isSelected ? highlightedColor : secondaryColor);
      point(posArr[0],posArr[1]);
    }
  }

  
}