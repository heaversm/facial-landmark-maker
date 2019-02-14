let data = {}; // Global object to hold results from the loadJSON call
let coords = []; // Global array to hold all shapes
let shapes = [];
let mousePressedCoords = [];
let mouseReleasedCoords = [];
let isMousePressed = false;
let closestCoordIndex;

function preload() {
  data = loadJSON('assets/face-points.json');
}

function loadData() {
  //draw initial face landmarks
  let shapesData = data['shapes'];
  for (let i = 0; i < shapesData.length; i++) {
    // Get each object in the array
    let shapeData = shapesData[i];
    shapes.push(new FaceFeature(shapeData));
    shapes[i].initShape(); 
  }
  shapes.splice(2,3);
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
    for (let i = 0; i < coords.length; i++) {
      let curCoord = coords[i];
      let curDist = dist(mouseX, mouseY, curCoord[0], curCoord[1]);
      if (curDist < smallestDist){
        smallestDist = curDist;
        closestCoordIndex = i;
      }
    }
  }
  console.log(closestCoordIndex);
}

function mouseReleased() {
  isMousePressed = false;
}

function draw() {
  if (isMousePressed){
    let mouseMovedX = Math.abs(mouseX - mousePressedX);
    let mouseMovedY = Math.abs(mouseY - mousePressedY);
    coords[closestCoordIndex].posX
  }
}

class FaceFeature {
  constructor(shapeData){
    this.points = shapeData.points;
    this.doCloseShape = shapeData.close;
    this.numPoints = this.points.length;
    
  }

  initShape(){
    this.drawShape(true);
  }

  drawShape(isInitial){
    beginShape();
    for (let j = 0; j < this.numPoints; j++) {
      let position = this.points[j];
      let posX = position.x;
      let posY = position.y;
      let posArr = [posX,posY];
      if (isInitial){
        coords.push(posArr);
      }
      vertex(posX,posY);
    }
    this.doCloseShape ? endShape(CLOSE) : endShape();
  }

  updateShape(i,pointsArr){
    this.points[i] = pointsArr;
    drawShape();
  }
}