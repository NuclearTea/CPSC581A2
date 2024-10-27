
console.log("Hello 🌎");

const ACTION_NONE = "No Action";
const ACTION_PULL = "Pull";
const ACTION_TWIST = "Twist";
const ACTION_SHAKE = "Shake";

const correctPassword = [ACTION_PULL, ACTION_TWIST, ACTION_SHAKE];
let guessPassword = [];

const RECORDING_TIME = 100;
const ACCEL_THRESHOLD = 10;

let recordingData = [];
let isRecording = false;
let startRecordingTime = 0;

let pullCounter = 0;
let twistCounter = 0;
let shakeCounter = 0;

function requestPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    console.log('Motion permission granted.');
                    window.addEventListener('devicemotion', handleMotion, true);
                }
            })
            .catch(console.error);

        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    console.log('Orientation permission granted.');
                    window.addEventListener('deviceorientation', handleOrientation, true);
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('devicemotion', handleMotion, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
    }
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const date = now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    document.getElementById("time").textContent = time;
    document.getElementById("date").textContent = date;
}

setInterval(updateClock, 1000);
updateClock();
function updateFieldIfNotNull(fieldName, value, precision = 2) {
    if (value != null)
        document.getElementById(fieldName).innerHTML = value.toFixed(precision);
}

function handleOrientation(event) {
    updateFieldIfNotNull('Orientation_a', event.alpha);
    updateFieldIfNotNull('Orientation_b', event.beta);
    updateFieldIfNotNull('Orientation_g', event.gamma);
    // eventLoop();
}

function readRecordedData() {
    pullCounter = 0;
    twistCounter = 0;
    shakeCounter = 0;

    for (let dataPoint of recordingData) {
        if (detectBopPull(dataPoint)) pullCounter++;
        if (detectBopTwist(dataPoint)) twistCounter++;
        if (detectBopShake(dataPoint)) shakeCounter++;
    }

    if (pullCounter > 15) return ACTION_SHAKE;
    if (twistCounter > 1) return ACTION_TWIST;
    if (pullCounter > 1) return ACTION_PULL;

    return ACTION_NONE;
}

function detectBopPull(dataPoint) {
    return dataPoint.acc_y < -5.0;
}

function detectBopTwist(dataPoint) {
    return (dataPoint.gyro_x < -500.0 && dataPoint.gyro_z > 500.0) || (dataPoint.gyro_x > 500.0 && dataPoint.gyro_z < -500.0);
}

function detectBopShake(dataPoint) {
    return dataPoint.acc_y < -1000.0;
}

function handleMotion(event) {
    const eventData = {
        acc_x: event.acceleration.x,
        acc_y: event.acceleration.y,
        acc_z: event.acceleration.z,
        gyro_x: event.rotationRate.beta,
        gyro_y: event.rotationRate.gamma,
        gyro_z: event.rotationRate.alpha
    };

    recordingData.push(eventData);
    detectBopEventStart();
    detectBopEventEnd();
}

function detectBopEventStart() {
    if (isRecording || recordingData.length < 1) return;

    const dataPoint = recordingData[recordingData.length - 1];
    if (dataPoint.acc_x > ACCEL_THRESHOLD || dataPoint.acc_y > ACCEL_THRESHOLD || dataPoint.acc_z > ACCEL_THRESHOLD) {
        console.log("Recording started");
        isRecording = true;
        startRecordingTime = new Date().getTime();
    }
}

function detectBopEventEnd() {
    if (!isRecording) return;

    let now = new Date().getTime();
    if (now - startRecordingTime < 1000) return;

    let action = readRecordedData();
    console.log("Recording stopped");
    isRecording = false;
    recordingData = [];

    document.getElementById("LastAction").innerHTML = action;
    guessPassword.push(action);

    let isCorrect = guessPassword.every((action, index) => action === correctPassword[index]);
    if (isCorrect && guessPassword.length === correctPassword.length) {
        document.getElementById("LastAction").innerHTML = "Correct Password!";
        document.getElementById("LastAction").classList.add("correct-password");
        setTimeout(() => unlockScreen(), 1000);
    } else if (!isCorrect) {
        guessPassword = [];
    }
}

function unlockScreen() {
    document.getElementById("lockScreen").style.display = "none";
    document.getElementById("homeScreen").style.display = "flex";
}

document.getElementById("swipe").addEventListener("click", unlockScreen);

