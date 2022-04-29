let hand;
let video;
let points = [];
let poses = [];
var poseImage;
let thirtysecs;
let wrong;
//let pose = [];


let posesArray = ['Gyana Mudra (Knowledge Seal)', 'Aapana Vayu Mudra (Descending Wind Seal)', 'Prana Mudra (Vital Energy Seal)', 'Surya Mudra (Sun Seal)', 'Varuna Mudra (Water Seal)', 'Vayu Mudra (Wind Seal)'];
var imgArray = new Array();
let labelArray = ['g', 'a', 'p', 's', 'w', 'v'];
var playlist = new Array();

//let pose;
let skeleton;
var poseCounter;
var labelIndex;
var errorCounter;
var iterationCounter;
let poseLabel
var target;

var timeLeft;

let brain;
let state = 'waiting';
let targetLabel;


function setup() {
  var canvas = createCanvas(640, 480);
  canvas.position(45, 45);
  video = createCapture(VIDEO);
  video.hide();
  //video.size(width, height);

  hand = ml5.handpose(video, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  hand.on('predict', gotPoses);
  // Hide the video element, and just show the canvas
  

  imgArray[0] = new Image();
    imgArray[0].src = '../assets/img/mudras/gyana.png';
    imgArray[1] = new Image();
    imgArray[1].src = '../assets/img/mudras/apanaVayu.png';
    imgArray[2] = new Image();
    imgArray[2].src = '../assets/img/mudras/prana.png';
    imgArray[3] = new Image();
    imgArray[3].src = '../assets/img/mudras/surya.png';
    imgArray[4] = new Image();
    imgArray[4].src = '../assets/img/mudras/varuna.png';
    imgArray[5] = new Image();
    imgArray[5].src = '../assets/img/mudras/vayu.png';

    playlist[0] = new Audio();
    playlist[0].src = '../assets/audio/wrong.mp3';

  poseCounter = 0;
    labelIndex = 0;
    target = posesArray[poseCounter];
    document.getElementById("poseName").textContent = target;
    timeLeft = 10;
    document.getElementById("time").textContent = "00:" + timeLeft;
    errorCounter = 0;
    iterationCounter = 0;
    document.getElementById("poseImg").src = imgArray[poseCounter].src;

  let options = {
    inputs: 42,
    outputs: 6,
    task: 'classification',
    debug: true
  }
 
  brain = ml5.neuralNetwork(options);
 
  const modelInfo = {
        model: '../models/modelHand/modelHand.json',
        metadata: '../models/modelHand/modelHand_meta.json',
        weights: '../models/modelHand/modelHand.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
 
  // brain.loadData('hand.json', dataReady);
}

function brainLoaded() {
  console.log('pose classification ready');
  classifyPose();
}


function classifyPose() {
  if(points.length > 0) {
    pose = points[0].landmarks;
    let inputs = [];
    for(let i = 0; i < pose.length; i++) {
        let x = pose[i][0];
        let y = pose[i][1];
        let z = pose[i][2];
        inputs.push(x);
        inputs.push(y);
        inputs.push(z);
      }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  console.log(results);
    if (results[0].confidence > 0.7) {
      poseLabel = results[0].label;
      console.log("Confidence");
      if (results[0].label == labelArray[labelIndex].toString()) {
          console.log(labelArray[labelIndex]);
          iterationCounter = iterationCounter + 1;

          console.log(iterationCounter)
          if (iterationCounter == 10) {
              console.log("30!")
              iterationCounter = 0;
              nextPose();
          } else {
              console.log("doin this")
              timeLeft = timeLeft - 1;
              if (timeLeft < 10) {
                  document.getElementById("time").textContent = "00:0" + timeLeft;
              } else {
                  document.getElementById("time").textContent = "00:" + timeLeft;
              }
              setTimeout(classifyPose, 1000);
          }
      } else {
          errorCounter = errorCounter + 1;
          console.log("error");
          if (errorCounter >= 4) {
              document.getElementById("player").src = playlist[0].src;
              console.log("four errors");
              iterationCounter = 0;
              timeLeft = 10;
              if (timeLeft < 10) {
                  document.getElementById("time").textContent = "00:0" + timeLeft;
              } else {
                  document.getElementById("time").textContent = "00:" + timeLeft;
              }
              errorCounter = 0;
              setTimeout(classifyPose, 100);
          } else {
              setTimeout(classifyPose, 100);
          }
      }
  } else {
      console.log("whatwe really dont want")
      setTimeout(classifyPose, 100);
  }
}

function dataReady() {
  console.log("data loaded");
  brain.normalizeData();
  brain.train({epochs: 50}, finished);
}

function finished() {
  console.log('model trained');
  brain.save();
}


function gotPoses(poses) {
  points = poses;
  if(poses.length > 0) {
    pose = poses[0].landmarks;
   
    // if(state == 'collecting') {
    //   let inputs = [];
    //   for(let i = 0; i < pose.length; i++) {
    //     let x = pose[i][0];
    //     let y = pose[i][1];
    //     let z = pose[i][2];
    //     inputs.push(x);
    //     inputs.push(y);
    //     inputs.push(z);
    //   }

    //   let target = [targetLabel];    
    //   brain.addData(inputs, target);
    // }
  }
 
}


function modelReady() {
  console.log("Model ready!");
}

function draw() {
  //translate(video.width, 0);
  image(video, 0, 0, width, height);
  //image(video, 0, 0);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < points.length; i += 1) {
    const prediction = points[i];
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], 10, 10);
    }
  }
}

function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < points.length; i++) {
    let annotations = points[i].annotations;
    // For every skeleton, loop through all body connections
    stroke(255, 0, 0);
    for (let j = 0; j < annotations.thumb.length - 1; j++) {
      // let partA = annotations.thumb[j][0];
      // let partB = annotations.thumb[j][1];
      line(annotations.thumb[j][0], annotations.thumb[j][1], annotations.thumb[j + 1][0], annotations.thumb[j + 1][1]);
    }
    for (let j = 0; j < annotations.indexFinger.length - 1; j++) {
      line(annotations.indexFinger[j][0], annotations.indexFinger[j][1], annotations.indexFinger[j + 1][0], annotations.indexFinger[j + 1][1]);
    }
    for (let j = 0; j < annotations.middleFinger.length - 1; j++) {
      line(annotations.middleFinger[j][0], annotations.middleFinger[j][1], annotations.middleFinger[j + 1][0], annotations.middleFinger[j + 1][1]);
    }
    for (let j = 0; j < annotations.ringFinger.length - 1; j++) {
      line(annotations.ringFinger[j][0], annotations.ringFinger[j][1], annotations.ringFinger[j + 1][0], annotations.ringFinger[j + 1][1]);
    }
    for (let j = 0; j < annotations.pinky.length - 1; j++) {
      line(annotations.pinky[j][0], annotations.pinky[j][1], annotations.pinky[j + 1][0], annotations.pinky[j + 1][1]);
    }

    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.thumb[0][0], annotations.thumb[0][1]);
    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.indexFinger[0][0], annotations.indexFinger[0][1]);
    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.middleFinger[0][0], annotations.middleFinger[0][1]);
    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.ringFinger[0][0], annotations.ringFinger[0][1]);
    line(annotations.palmBase[0][0], annotations.palmBase[0][1], annotations.pinky[0][0], annotations.pinky[0][1]);
  }
}


function nextPose() {

  if (labelIndex == 5) {
      console.log("Well done, you have learnt all poses!");
      document.getElementById("finish").style.display = 'block';
      document.getElementById("time").style.display = 'none';
      document.getElementById("seconds").style.display = 'none';
      document.getElementById("poseName").style.display = 'none';
      document.getElementById("poseImg").style.display = 'none';
      document.getElementById("sparkles").style.display = 'block';
      canvas.style.visibility = "hidden";
  } else {
      console.log("Well done, you all poses!");

      errorCounter = 0;
      iterationCounter = 0;
      poseCounter = poseCounter + 1;
      labelIndex = labelIndex + 1;
      console.log("next pose target label" + labelArray[labelIndex]);
      target = posesArray[poseCounter];
      document.getElementById("poseName").textContent = target;
      document.getElementById("welldone").style.display = 'block';

      document.getElementById("poseImg").src = imgArray[poseCounter].src;
      console.log("classifying again");
      timeLeft = 10;
      document.getElementById("time").textContent = "00:" + timeLeft;
      setTimeout(classifyPose, 100)
  }
}
