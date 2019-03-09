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
let activePicker,secondaryPicker,selectedPicker;

let ww = 256;
let wh = 256;
let sfX, sfY; //x position with base width and height scaled to loaded image ratio
let imgWidth, imgHeight;

let cGreen,cBlue,cRed, cYellow, cWhite; //some color variables

let c; //canvas
let img;
let imgName = 'assets/001.png';
let pointsFileName = '001.txt'; //write to a file with a name based off the loaded image
let writer;


let $colors = document.querySelectorAll('.color');
let $saveButton = document.querySelector('.save-btn');
let $imageButton = document.querySelector('.image-btn');
let $imageInput = document.querySelector('.image-input');
let $pointsButton = document.querySelector('.points-btn');
let $pointsInput = document.querySelector('.points-input');
let activeColor, secondaryColor, selectedColor;

let loadedPoints = [];
let loadedPointsArr = [];

function preload() {
  data = loadJSON('assets/face-points.json');
  let urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('image')){
    imgName = urlParams.get('image');
    const lastSlashIndex = imgName.lastIndexOf('/');
    if (lastSlashIndex == -1){ //if no path specified for image
      pointsFileName = imgName.substring(0, imgName.indexOf('.')) + '.txt';
    } else { //get everything after the last slash as the image name
      pointsFileName = imgName.substring(lastSlashIndex+1, imgName.indexOf('.')) + '.txt';
    }
    
    $imageInput.value = imgName;
  }
  img = loadImage(`${imgName}`,imgLoadSuccess,imgLoadError); // Load the image

  let pointsFile;
  if (urlParams.has('points')){
    pointsFile = urlParams.get('points');
    pointsFileName = pointsFile;
    $pointsInput.value = pointsFileName;
    loadedPoints = loadStrings(`${pointsFile}`,pointsLoadSuccess,pointsLoadError);
  }

}

function pointsLoadSuccess(){
  //console.log('success');
}

function pointsLoadError(){
  window.location = `http://${window.location.host}`;
}

function imgLoadSuccess(){
  //console.log('success');
}

function imgLoadError(){
  window.location = `http://${window.location.host}`;
}

function drawPointsInitial() {
  let shapesData = data['shapes'];
  //draw initial face landmarks
  if (loadedPoints.length){

    for (var j=0;j<loadedPoints.length;j++){
      let thisPointStr = loadedPoints[j];
      let thisPointsArr = thisPointStr.split(" ");
      let thisPointsObj = {
        "x": parseInt(thisPointsArr[0]),
        "y": parseInt(thisPointsArr[1]),
      }
      if (!isNaN(thisPointsObj.x) &&  !isNaN(thisPointsObj.y)){
        loadedPointsArr.push(thisPointsObj);
      }
    }
  }

  for (let i = 0; i < shapesData.length; i++) {
    // Get each object in the array
    let shapeData = shapesData[i];
    let shapeArr = [];
    let startIndex = shapeData.startIndex;

    for (let j = 0; j < shapeData.points.length; j++) {
      let position;

      if (loadedPoints.length){
        const lpIndex = startIndex + j;
        position = loadedPointsArr[lpIndex];
      } else {
        position = shapeData.points[j];
      }
      
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
  writer = createWriter(pointsFileName);
  imgWidth = img.width;
  imgHeight = img.height;
  c = createCanvas(imgWidth, imgHeight);
  sfX = imgWidth/ww;
  sfY = imgHeight/wh;
  cGreen = color('#28a745');
  cBlue = color('#0062cc');
  cRed = color('#dc3545');
  cYellow = color('#ffc107');
  cWhite = color('#ffffff');
  activeColor = cBlue;
  secondaryColor = cYellow;
  selectedColor = cWhite;
  activePicker = createColorPicker(activeColor)
    .parent('active-picker-container')
    .addClass('color-picker-input');
  secondaryPicker = createColorPicker(secondaryColor)
    .parent('secondary-picker-container')
    .addClass('color-picker-input');
  selectedPicker = createColorPicker(selectedColor)
    .parent('selected-picker-container')
    .addClass('color-picker-input');
  activePicker.input(setActiveColor);
  secondaryPicker.input(setSecondaryColor);
  selectedPicker.input(setSelectedColor);
  background(0);
  noSmooth();
  noFill();
  stroke(activeColor);
  drawPointsInitial();
  $saveButton.addEventListener('click',handlePrintLandmarks);
  $imageButton.addEventListener('click',()=>{
    handleLoad('image')
  });
  $pointsButton.addEventListener('click',()=>{
    handleLoad('points')
  });
  

  $colors.forEach((el)=>{
    el.addEventListener('click',()=>{
      handleColorChange(el.dataset.id);
    });
  });
  document.querySelector('canvas').focus();
}

function minimizeUI(){
  $('.collapse').collapse('hide');
}

function handleLoad(type){
  const imgToLoad = $imageInput.value;
  const pointsToLoad = $pointsInput.value;

  if (!imgToLoad && !pointsToLoad){
    return;
  }

  let urlToLoad;
  if (imgToLoad && pointsToLoad){
    urlToLoad = `http://${window.location.host}?image=${imgToLoad}&points=${pointsToLoad}`;
  } else if (imgToLoad && !pointsToLoad){
    urlToLoad = `http://${window.location.host}?image=${imgToLoad}`;
  } else if (pointsToLoad && !imgToLoad){
    urlToLoad = `http://${window.location.host}?points=${pointsToLoad}`;
  }
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

function setActiveColor(){
  activeColor = activePicker.color();
}

function setSecondaryColor(){
  secondaryColor = secondaryPicker.color();
}

function setSelectedColor(){
  selectedColor = selectedPicker.color();
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
      stroke(position.isSelected ? selectedColor : secondaryColor);
      point(posArr[0],posArr[1]);
    }
  }

  
}