const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
// canvas is 480x480

document.getElementById('audio_file').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (file) {
        const objectURL = URL.createObjectURL(file);
        audio_element.src = objectURL;
    }
});



const audio_element = document.getElementById("audio");

const audio_ctx = new (window.AudioContext || window.webkitAudioContext)();
const source_node = audio_ctx.createMediaElementSource(audio_element);
const analyser = audio_ctx.createAnalyser();

analyser.fftSize = 256;
const buffer_length = analyser.frequencyBinCount;
const data_array = new Uint8Array(buffer_length);

source_node.connect(analyser);
analyser.connect(audio_ctx.destination);

// Ensure audio context resumes on user interaction
audio_element.addEventListener("play", () => {
    if (audio_ctx.state === "suspended") {
        audio_ctx.resume();
    }
    });

function draw_audio_line() {
    analyser.getByteTimeDomainData(data_array);

    ctx.globalCompositeOperation = "difference";

    const slice_height = 480 / buffer_length;

    // --- Main waveform line (vertical) ---
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    for (let i = 0; i < buffer_length; i++) {
        const v = data_array[i] / 128.0;
        const x = (v * 480) / 4 + 200;
        const y = i * slice_height;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();
}

var Img = [];
for (var i = 0; i < 30; i++) {
    Img[i] = new Image();
    Img[i].src = "images/field/"+i+".gif";
    // let temp = new Image();
    // temp.onload = () => {
    //     console.log(i,"loaded")
    //     Img[i] = document.createElement("canvas");
    //     Img[i].width = 480;
    //     Img[i].height = 480;
    //     Img[i].getContext("2d").drawImage(temp,0,0);
    // }
    // temp.src = "images/field/"+i+".gif";

}

var Img2 = [];
for (var i = 0; i < 6; i++) {
    Img2[i] = new Image();
    Img2[i].src = "images/water/"+i+".gif";
}

var eyes = [];
for (var i = 1; i <= 15; i++) {
    eyes[i-1] = new Image();
    eyes[i-1].src = "images/eyes/eyes-"+i.toString().padStart(2,"0")+".png";
}
canvas.eye_canvas = document.createElement("canvas");
canvas.eye_canvas.width = 480;
canvas.eye_canvas.height = 480;
const eye_ctx = canvas.eye_canvas.getContext("2d");

const font = "24px Helvetica";
const letter_height = 30;//40;

const text_input = document.getElementById("text_input");

var display_text = "▢▣▤AHH▥▦▧▨▩SO◧◨◩◪◫◰◱◲▢▣DISTORTED▤▥▦▧▨▩◧◨";

text_input.value = display_text;
document.getElementById("text_button").addEventListener("click",(ev)=>{
    display_text = text_input.value;
});

var running = true;
var n = 0;
var time_offset = 0;
var reset_time = false;
function main_loop(now=0){

    if (reset_time){
        reset_time = false;
        time_offset = now;
    }
    now-=time_offset;

    // let test_text = "▢▣▤▥▦▧▨▩◧◨◩◪◫◰◱◲";
    let offset = Math.floor(now/120);

    ctx.globalCompositeOperation = "source-over";

    ctx.clearRect(0,0,480,480);

    ctx.fillStyle="black";
    ctx.beginPath();
    ctx.rect(0,0,480,480);
    ctx.fill();

    ctx.drawImage(Img[Math.floor(n/11)%Img.length],0,0);
    ctx.drawImage(Img[Math.floor(n/10)%Img.length],0,250);

    ctx.drawImage(Img2[Math.floor(n/8)%6],0,0,80,440,0,0,80,480);

    ctx.fillStyle="black";
    ctx.beginPath();
    ctx.rect(0,110,480,240);
    ctx.fill();

    ctx.globalCompositeOperation = "difference";
    ctx.fillStyle="white";
    ctx.beginPath();
    // ctx.rect(10,110,41,240);
    ctx.rect(0,110,80,240)
    ctx.fill();

    eye_ctx.globalAlpha=0.05;
    eye_ctx.drawImage(eyes[Math.floor(n/10)%eyes.length],80,110,400,240);
    // ctx.drawImage(canvas.eye_canvas,132,75);
    ctx.drawImage(canvas.eye_canvas,0,0,480,270,132,75,480,270)

    ctx.globalCompositeOperation = "difference";
    ctx.fillStyle = "white";
    ctx.font = "150px Helvetica";
    ctx.fillText((audio_element.currentTime%60).toFixed(2).padStart(5,"0"),80,470)
    ctx.fillText((audio_element.currentTime/60).toFixed(2).padStart(5,"0"),80,105)

    ctx.font = "200px Helvetica Compressed"
    ctx.fillText("IM THE",-4,252)
    ctx.font = "200px Helvetica Compressed"
    ctx.fillText("ONE",-4,110+240)

    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.rect(25,110,25,240);
    ctx.fill();

    ctx.font = font;
    ctx.fillStyle = "black";
    for (let i = 0; i < display_text.length; i++) {
        const char = display_text[(i + offset) % display_text.length];
        const metrics = ctx.measureText(char);
        const charWidth = metrics.width;
        const x = 37 - charWidth / 2; // Center the character around x = 10
        const n = Math.max(Math.ceil((letter_height * display_text.length - 480) / letter_height),1)+1;
        const y = (letter_height * i + now / 7) % (480 + letter_height * n);    

        ctx.fillText(char, x, y);
    }

    draw_audio_line();
    // n+=1;
    n = Math.floor(now*60/1000)

    if (running){
        window.requestAnimationFrame(main_loop)
    }
}

window.onload = () => {
    main_loop();
}