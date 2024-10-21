
console.log("Hello 🌎");

// let t = document.querySelector("#text");
// console.log(t);
// t.innerHTML = "Waiting for device motion"


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
    let counterElement = document.getElementById("num-observed-events")
    let eventCount = parseInt(counterElement.innerHTML)
    counterElement.innerHTML = eventCount + 1;
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