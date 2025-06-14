const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");
// canvas is 480x480

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

function draw_audio_line(reset=false) {
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

const font = "48px monospace";
const letter_height = 40;

const display_text = "▢▣▤▥▦▧▨▩◧◨◩◪◫◰◱◲";

var running = true;
var n = 0;
function main_loop(now=0){

    // let test_text = "▢▣▤▥▦▧▨▩◧◨◩◪◫◰◱◲";
    let offset = Math.floor(now/200);

    ctx.globalCompositeOperation = "source-over";

    ctx.clearRect(0,0,480,480);

    ctx.fillStyle="black";
    ctx.beginPath();
    ctx.rect(0,0,480,480);
    ctx.fill();

    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.rect(10,0,41,480);
    ctx.fill();

    ctx.font = font;
    ctx.fillStyle = "black";
    for (let i = 0; i < display_text.length; i++) {
        const char = display_text[(i + offset) % display_text.length];
        const metrics = ctx.measureText(char);
        const charWidth = metrics.width;
        const x = 30 - charWidth / 2; // Center the character around x = 10
        const y = (letter_height * i + now / 7) % Math.max(480 + letter_height, letter_height * display_text.length);
        ctx.fillText(char, x, y);
    }

    // ctx.globalCompositeOperation = "difference";
    // ctx.fillStyle = "white";
    // ctx.font = "700px monospace";
    // ctx.fillText("Whats up?",0,480)

    draw_audio_line(n<20);

    n+=1;

    if (running){
        window.requestAnimationFrame(main_loop)
    }
}

window.onload = () => {
    main_loop();
}