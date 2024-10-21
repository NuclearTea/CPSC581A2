
console.log("Hello 🌎");

// let t = document.querySelector("#text");
// console.log(t);
// t.innerHTML = "Waiting for device motion"

const lastData = [];

function updateFieldIfNotNull(fieldName, value, precision = 10) {
    if (value != null)
        document.getElementById(fieldName).innerHTML = value.toFixed(precision);
}


function handleOrientation(event) {
    updateFieldIfNotNull('Orientation_a', event.alpha);
    updateFieldIfNotNull('Orientation_b', event.beta);
    updateFieldIfNotNull('Orientation_g', event.gamma);
    incrementEventCount();
}

function incrementEventCount() {
    // let counterElement = document.getElementById("num-observed-events")
    // let eventCount = parseInt(counterElement.innerHTML)
    // counterElement.innerHTML = eventCount + 1;

    // Get the time difference between the first and last event in lastData
    let timeDifference = 0;
    if (lastData.length > 0) {
        timeDifference = lastData[lastData.length - 1].time - lastData[0].time;
        document.getElementById("TimeDifference").innerHTML = timeDifference;
    }

    // Only keep a 100ms buffer in lastData
    if (timeDifference > 100) {
        while (true) {
            let nextTimeDifference = lastData[lastData.length - 1].time - lastData[1].time;
            if (nextTimeDifference < 100) {
                break;
            }
            lastData.shift();
            timeDifference = nextTimeDifference;
        }
    }

    lastData.push({
        'acc_gx': document.getElementById('Accelerometer_gx').innerHTML,
        'acc_gy': document.getElementById('Accelerometer_gy').innerHTML,
        'acc_gz': document.getElementById('Accelerometer_gz').innerHTML,
        'acc_x': document.getElementById('Accelerometer_x').innerHTML,
        'acc_y': document.getElementById('Accelerometer_y').innerHTML,
        'acc_z': document.getElementById('Accelerometer_z').innerHTML,
        'acc_i': document.getElementById('Accelerometer_i').innerHTML,
        'gyro_z': document.getElementById('Gyroscope_z').innerHTML,
        'gyro_x': document.getElementById('Gyroscope_x').innerHTML,
        'gyro_y': document.getElementById('Gyroscope_y').innerHTML,
        'time': new Date().getTime()
    });

    // Print lastData
    console.log(lastData);
}


function handleMotion(event) {
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
    incrementEventCount();
}


// document.querySelector("#toggle").onclick = function(e){
//   e.preventDefault();

//   console.log("click")

//   //motion event
//     DeviceMotionEvent.requestPermission()
//     .then(response => {
//       if (response == 'granted') {
//         window.addEventListener('devicemotion', handleMotion, true);
//       }
//     })
//     .catch(console.error)



//   //orientation event

//     DeviceOrientationEvent.requestPermission()
//     .then(response => {
//       if (response == 'granted') {
//         window.addEventListener('deviceorientation', handleOrientation, true);
//       }
//     })
//     .catch(console.error)

// }

window.addEventListener('deviceorientation', function (event) {
    //console.log(event.alpha + ' : ' + event.beta + ' : ' + event.gamma);
    handleOrientation(event);
});

window.addEventListener('devicemotion', function (event) {
    //console.log(event.alpha + ' : ' + event.beta + ' : ' + event.gamma);
    handleMotion(event);
});