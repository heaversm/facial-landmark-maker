let data = {}; // Global object to hold results from the loadJSON call
let shapes = []; // Global array to hold all shape arrays of coords
let mousePressedCoords = [];
let mouseReleasedCoords = [];
let isMousePressed = false;
let closestShapeIndex;
let closestCoordIndex;
let mouseMovedX, mouseMovedY;

let ww = 256;
let wh = 256;
let sfX, sfY;
let imgWidth, imgHeight;

let c; //canvas
let img;
let imgName = '002.png';
let fileName = imgName.substring(0, imgName.indexOf('.')) + '.txt';
let writer;

function preload() {
  data = loadJSON('assets/face-points.json');
  let urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('image')){
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
    
    beginShape();

    for (let j = 0; j < shapeData.points.length; j++) {
      let position = shapeData.points[j];
      let posX = map(position.x,0,ww,0,ww*sfX);
      let posY = map(position.y,0,wh,0,wh*sfY);
      let posArr = [posX,posY];
      shapeArr.push(posArr);
      vertex(posX,posY);
    }
    shapes.push(shapeArr);
    shapeData.doCloseShape ? endShape(CLOSE) : endShape();

  }

}

function setup() {
  writer = createWriter(fileName);
  imgWidth = img.width;
  imgHeight = img.height;
  c = createCanvas(imgWidth, imgHeight);
  sfX = imgWidth/ww;
  sfY = imgHeight/wh;
  background(0);
  noSmooth();
  noFill();
  stroke(123,255,0);
  drawPointsInitial();
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
  select('body').addClass('mousePressed');
}

function mouseReleased() {
  handleMouseReleased();
}

function handleMouseReleased(){
  select('body').removeClass('mousePressed');
  isMousePressed = false;
  mouseMovedX = 0;
  mouseMovedY = 0;
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

function draw() {
  background(0);
  image(img, 0, 0);
  if (isMousePressed){

    if (mouseX > 0 && mouseX < imgWidth && mouseY > 0 && mouseY < imgHeight){
      shapes[closestShapeIndex][closestCoordIndex][0] = mouseX;
      shapes[closestShapeIndex][closestCoordIndex][1] = mouseY;
    } else {
      handleMouseReleased();
      return;
    }

  }
  let shapesData = data['shapes'];
  for (let i = 0; i < shapes.length; i++) {
    // Get each object in the array
    let shapeData = shapesData[i];
    let shapeArrData = shapes[i];
    beginShape();
    for (let j = 0; j < shapeArrData.length; j++) {
      let posArr = shapeArrData[j];
      vertex(posArr[0],posArr[1]);
    }
    shapeData.doCloseShape ? endShape(CLOSE) : endShape();
  }
  
}