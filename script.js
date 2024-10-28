console.log("Hello 🌎");

// let t = document.querySelector("#text");
// console.log(t);
// t.innerHTML = "Waiting for device motion"

const ACTION_NONE = "No Action";
const ACTION_BOP = "Bop";
const ACTION_PULL = "Pull";
const ACTION_TWIST = "Twist";
const ACTION_SHAKE = "Shake";

const RECORDING_TIME = 100; // 100ms
const GYRO_THRESHOLD = 200.0;
const ACCEL_THRESHOLD = 10.0;

const lastData = [];
let recordingData = [];
let isRecording = false;
let startRecordingTime = 0;
let nextSound = ACTION_NONE;

const MAX_ATTEMPTS = 3;
let attempts = 0;

const correctPassword = [ACTION_BOP, ACTION_PULL, ACTION_TWIST, ACTION_SHAKE];
let guessPassword = [];

let acc_gx = 0.0;
let acc_gy = 0.0;
let acc_gz = 0.0;
let acc_x = 0.0;
let acc_y = 0.0;
let acc_z = 0.0;
let acc_i = 0.0;
let gyro_z = 0.0;
let gyro_x = 0.0;
let gyro_y = 0.0;


// Function to request motion and orientation permissions 
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
    }
}


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

function handleCorrectAttempt(success) {
    if (success) {
        document.getElementById("audioSuccess").play();
        nextSound = ACTION_NONE;
        return;
    }

    if (nextSound == ACTION_BOP) {
        document.getElementById("audioBop").play();
    } else if (nextSound == ACTION_PULL) {
        document.getElementById("audioPull").play();
    } else if (nextSound == ACTION_TWIST) {
        document.getElementById("audioTwist").play();
    } else if (nextSound == ACTION_SHAKE) {
        document.getElementById("audioShake").play();
    }
    nextSound = ACTION_NONE;
}

function detectBopGenericAction(dataPoint) {
    if (dataPoint.acc_x > ACCEL_THRESHOLD || dataPoint.acc_y > ACCEL_THRESHOLD || dataPoint.acc_z > ACCEL_THRESHOLD) {
        return true;
    } else if (dataPoint.gyro_x > GYRO_THRESHOLD || dataPoint.gyro_y > GYRO_THRESHOLD || dataPoint.gyro_z > GYRO_THRESHOLD) {
        return true;
    }
}

function detectBopButton() {
    guessPassword.push(ACTION_BOP);
    document.getElementById("LastAction").innerHTML = ACTION_BOP;
    checkPassword();
}

function detectBopPull(dataPoint) {
    // Detect a 1-axis change in the accelerometer (Pull)
    const acc_values = [dataPoint.acc_x, dataPoint.acc_y, dataPoint.acc_z];
    for (let i = 0; i < acc_values.length; i++) {
        if (acc_values[i] > ACCEL_THRESHOLD || acc_values[i] < -ACCEL_THRESHOLD) {
            return true;
        }
    }
    return false;
}

function detectBopTwist(dataPoint) {
    // Detect a 2-axes change in the gyroscope (Twist)
    const gyro_values = [dataPoint.gyro_x, dataPoint.gyro_y, dataPoint.gyro_z];
    for (let i = 0; i < gyro_values.length; i++) {
        if (gyro_values[i] > GYRO_THRESHOLD || gyro_values[i] < -GYRO_THRESHOLD) {
            for (let j = 0; j < gyro_values.length; j++) {
                if (i == j) continue;
                if (gyro_values[j] > GYRO_THRESHOLD || gyro_values[j] < -GYRO_THRESHOLD) {
                    return true;
                }
            }
        }
    }
    return false;
}

function detectBopShake(dataPoint) {
    // Detect a 1-axis change in the gyroscope ONLY (Shake)
    const gyro_values = [dataPoint.gyro_x, dataPoint.gyro_y, dataPoint.gyro_z];
    for (let i = 0; i < gyro_values.length; i++) {
        if ((gyro_values[i] > GYRO_THRESHOLD || gyro_values[i] < -GYRO_THRESHOLD)) {
            for (let j = 0; j < gyro_values.length; j++) {
                if (i == j) continue;
                if ((gyro_values[j] > GYRO_THRESHOLD || gyro_values[j] < -GYRO_THRESHOLD)) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}

function readRecordedData() {
    let twistCounter = 0;
    let pullCounter = 0;
    let shakeCounter = 0;
    for (let i = 0; i < recordingData.length; i++) {
        let dataPoint = recordingData[i];
        if (detectBopTwist(dataPoint)) {
            twistCounter++;
        }
        if (detectBopPull(dataPoint)) {
            pullCounter++;
        }
        if (detectBopShake(dataPoint)) {
            shakeCounter++;
        }
        
        console.log("Recorded[" + i + "]: ");
        console.log(recordingData[i]);
    }
    
    document.getElementById("TwistCounter").innerHTML = twistCounter;
    document.getElementById("PullCounter").innerHTML = pullCounter;
    document.getElementById("ShakeCounter").innerHTML = shakeCounter;
    
    if (pullCounter > 15 || shakeCounter > 15) {
        return ACTION_SHAKE;
    }
    if (twistCounter > 5 && twistCounter > pullCounter) {
        return ACTION_TWIST;
    }
    if (pullCounter > 2 && pullCounter >= twistCounter) {
        return ACTION_PULL;
    }
    
    return ACTION_NONE;
}

function handleFailedAttempt() {
    if (attempts >= MAX_ATTEMPTS) {
        document.getElementById("audioLocked").play();
        attempts = 0;
    } else {
        document.getElementById("audioFail").play();
        attempts++;
    }
}

function checkPassword() {
    // Check if the password is correct
    let isCorrect = true;
    for (let i = 0; i < guessPassword.length; i++) {
        if (guessPassword[i] != correctPassword[i]) {
            isCorrect = false;
            guessPassword = [];
            handleFailedAttempt();
            break;
        }
    }
    if (isCorrect) {
        let fullyCorrect = guessPassword.length == correctPassword.length;
        if (fullyCorrect) {
            document.getElementById("LastAction").innerHTML = "Correct Password!";
            guessPassword = [];
        }
        handleCorrectAttempt(fullyCorrect);
    }
}

function detectBopEventStart() {
    // Once the accelerometer reads a certain value, we can assume that the
    // user wants to record an action.
    if (isRecording) return;
    if (lastData.length < 1) return;

    let dataPoint = lastData[lastData.length - 1];
    if (detectBopGenericAction(dataPoint)) {
        // Start recording
        console.log("Recording started");
        document.getElementById("Recording").innerHTML = "YES!";
        recordingData.push(lastData);
        isRecording = true;
        startRecordingTime = new Date().getTime();
    }
}

function detectBopEventEnd() {
    if (!isRecording) return;

    let now = new Date().getTime();
    if (now - startRecordingTime < 1000) {
        return;
    }

    // Read the data to figure out what the action was
    let action = readRecordedData();
    nextSound = action;

    // Stop recording
    console.log("Recording stopped");
    document.getElementById("Recording").innerHTML = "No (stopped)";
    recordingData = [];
    isRecording = false;

    // Record the action
    document.getElementById("LastAction").innerHTML = action;
    if (action == ACTION_NONE) return;
    guessPassword.push(action);

    // Check if the password is correct
    checkPassword();
}

function updateBuffer() {
    // Get the time difference between the first and last event in lastData
    let timeDifference = 0;
    if (lastData.length > 0) {
        timeDifference = lastData[lastData.length - 1].time - lastData[0].time;
        document.getElementById("TimeDifference").innerHTML = timeDifference;
    }

    // Only keep a 100ms buffer in lastData
    if (timeDifference > RECORDING_TIME) {
        while (true) {
            let nextTimeDifference = lastData[lastData.length - 1].time - lastData[1].time;
            if (nextTimeDifference < RECORDING_TIME) {
                break;
            }
            lastData.shift();
            timeDifference = nextTimeDifference;
        }
    }
}

function eventLoop() {
    updateBuffer();

    const eventData = {
        'acc_gx': acc_gx,
        'acc_gy': acc_gy,
        'acc_gz': acc_gz,
        'acc_x': acc_x,
        'acc_y': acc_y,
        'acc_z': acc_z,
        'acc_i': acc_i,
        'gyro_x': gyro_x,
        'gyro_y': gyro_y,
        'gyro_z': gyro_z,
        'time': new Date().getTime()
    };
    lastData.push(eventData);
    if (isRecording) {
        recordingData.push(eventData);
    }

    detectBopEventStart();
    detectBopEventEnd();

    // Print lastData
    console.log(lastData);
}


function handleMotion(event) {
    acc_gx = event.accelerationIncludingGravity.x;
    acc_gy = event.accelerationIncludingGravity.y;
    acc_gz = event.accelerationIncludingGravity.z;
    acc_x = event.acceleration.x;
    acc_y = event.acceleration.y;
    acc_z = event.acceleration.z;
    acc_i = event.interval;
    gyro_x = event.rotationRate.beta;
    gyro_y = event.rotationRate.gamma;
    gyro_z = event.rotationRate.alpha;

    updateFieldIfNotNull('Accelerometer_gx', event.accelerationIncludingGravity.x);
    updateFieldIfNotNull('Accelerometer_gy', event.accelerationIncludingGravity.y);
    updateFieldIfNotNull('Accelerometer_gz', event.accelerationIncludingGravity.z);

    updateFieldIfNotNull('Accelerometer_x', event.acceleration.x);
    updateFieldIfNotNull('Accelerometer_y', event.acceleration.y);
    updateFieldIfNotNull('Accelerometer_z', event.acceleration.z);

    updateFieldIfNotNull('Accelerometer_i', event.interval, 2);

    updateFieldIfNotNull('Gyroscope_z', event.rotationRate.alpha);
    updateFieldIfNotNull('Gyroscope_x', event.rotationRate.beta);
    updateFieldIfNotNull('Gyroscope_y', event.rotationRate.gamma);

    eventLoop();
}

// Call permission request on page load (iOS 13+ compatibility)
window.addEventListener('load', function () {
    requestPermission();
});

// Event listeners for device motion and orientation (older versions or Android)
window.addEventListener('deviceorientation', function (event) {
    handleOrientation(event);
});

window.addEventListener('devicemotion', function (event) {
    handleMotion(event);
});

document.getElementById("audioBop").load();
document.getElementById("audioPull").load();
document.getElementById("audioTwist").load();
document.getElementById("audioShake").load();
document.getElementById("audioSuccess").load();
document.getElementById("audioFail").load();
document.getElementById("audioLocked").load();
