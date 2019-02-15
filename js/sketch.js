let data = {}; // Global object to hold results from the loadJSON call
let shapes = []; // Global array to hold all shape arrays of coords
let coords = []; // Global array to hold all vertex coords
let mousePressedCoords = [];
let mouseReleasedCoords = [];
let isMousePressed = false;
let closestShapeIndex;
let closestCoordIndex;
let mouseMovedX, mouseMovedY;

function preload() {
  data = loadJSON('assets/face-points.json');
}

function loadData() {
  //draw initial face landmarks
  let shapesData = data['shapes'];
  for (let i = 0; i < shapesData.length; i++) {
    // Get each object in the array
    let shapeData = shapesData[i];
    let shapeArr = [];
    
    beginShape();
    for (let j = 0; j < shapeData.points.length; j++) {
      let position = shapeData.points[j];
      let posX = position.x;
      let posY = position.y;
      let posArr = [posX,posY];
      coords.push(posArr);
      shapeArr.push(posArr);
      vertex(posX,posY);
    }
    shapes.push(shapeArr);
    shapeData.doCloseShape ? endShape(CLOSE) : endShape();
  }

}

function setup() {
  createCanvas(256, 256);
  background(0);
  noSmooth();
  noFill();
  stroke(123,255,0);
  loadData();
}

function mousePressed() {
  if (!isMousePressed){
    isMousePressed = true;
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
    console.log(shapes[closestShapeIndex][closestCoordIndex]);
  }
  
}

function mouseReleased() {
  isMousePressed = false;
  mouseMovedX = 0;
  mouseMovedY = 0;
}

function draw() {
  background(0);
  if (isMousePressed){
    //mouseMovedX = mouseX - mousePressedCoords[0];
    //mouseMovedY = mouseY - mousePressedCoords[1];

    //shapes[closestShapeIndex][closestCoordIndex][0] = shapes[closestShapeIndex][closestCoordIndex][0] + mouseMovedX;
    //shapes[closestShapeIndex][closestCoordIndex][1] = shapes[closestShapeIndex][closestCoordIndex][1] + mouseMovedY;
    shapes[closestShapeIndex][closestCoordIndex][0] = mouseX;
    shapes[closestShapeIndex][closestCoordIndex][1] = mouseY;



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