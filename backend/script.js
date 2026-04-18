const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const emotion = document.getElementById("emotion");
const age = document.getElementById("age");
const gender = document.getElementById("gender");
const bars = document.getElementById("bars");

let chart;

Promise.all([
faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
faceapi.nets.faceExpressionNet.loadFromUri('/models'),
faceapi.nets.ageGenderNet.loadFromUri('/models')
]).then(startVideo);

function startVideo(){
navigator.mediaDevices.getUserMedia({video:{}})
.then(stream=>{
video.srcObject=stream;
});
}

video.addEventListener("play",()=>{

const displaySize={
width:video.width,
height:video.height
}

faceapi.matchDimensions(canvas, displaySize);

setInterval(async()=>{

const detections = await faceapi
.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions())
.withFaceLandmarks()
.withFaceExpressions()
.withAgeAndGender();

const resized = faceapi.resizeResults(detections,displaySize);

canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);

faceapi.draw.drawDetections(canvas,resized);

if(detections.length>0){

let d = detections[0];

age.innerText = Math.round(d.age);
gender.innerText = d.gender;

let exp = d.expressions;

let topEmotion = Object.keys(exp).reduce((a,b)=>exp[a]>exp[b]?a:b);

emotion.innerText = topEmotion.toUpperCase();

renderBars(exp);
updateChart(exp);

}

},700);

});

function renderBars(exp){

bars.innerHTML="";

for(let e in exp){

bars.innerHTML+=`
<div class="bar">
${e.toUpperCase()} ${(exp[e]*100).toFixed(1)}%
<div class="fill" style="width:${exp[e]*100}%"></div>
</div>
`;

}

}

function takeShot(){

let link=document.createElement('a');
link.download='emotion-shot.png';
link.href=canvas.toDataURL();
link.click();

}

function updateChart(exp){

if(!chart){

const ctx=document.getElementById("chart");

chart=new Chart(ctx,{
type:'bar',
data:{
labels:Object.keys(exp),
datasets:[{
label:'Confidence',
data:Object.values(exp)
}]
}
});

}else{

chart.data.datasets[0].data=Object.values(exp);
chart.update();

}

}
