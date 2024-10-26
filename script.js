function startMainCode() {
  console.log("Hello 🌎");
  document.getElementById("swipe").hidden = true;
  const bopIt = document.getElementById("Bop-It");
  console.log("🚀 ~ startMainCode ~ bopIt:", bopIt.clientWidth);
  bopIt.display = "block";
  // let t = document.querySelector("#text");
  // console.log(t);
  // t.innerHTML = "Waiting for device motion"

  const ACTION_NONE = "No Action";
  const ACTION_BOP = "Bop";
  const ACTION_PULL = "Pull";
  const ACTION_TWIST = "Twist";
  const ACTION_SHAKE = "Shake";

  const RECORDING_TIME = 100; // 100ms
  const ACCEL_THRESHOLD = 10;

  const lastData = [];
  let recordingData = [];
  let isRecording = false;
  let startRecordingTime = 0;

  // const correctPassword = [ACTION_BOP, ACTION_PULL, ACTION_TWIST, ACTION_SHAKE];
  const correctPassword = [ACTION_PULL, ACTION_TWIST, ACTION_SHAKE];
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
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      DeviceMotionEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            console.log("Motion permission granted.");
            window.addEventListener("devicemotion", handleMotion, true);
          }
        })
        .catch(console.error);

      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === "granted") {
            console.log("Orientation permission granted.");
            window.addEventListener(
              "deviceorientation",
              handleOrientation,
              true
            );
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("devicemotion", handleMotion, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
  }

  function updateFieldIfNotNull(fieldName, value, precision = 2) {
    if (value != null)
      document.getElementById(fieldName).innerHTML = value.toFixed(precision);
  }

  function handleOrientation(event) {
    // updateFieldIfNotNull("Orientation_a", event.alpha);
    // updateFieldIfNotNull("Orientation_b", event.beta);
    // updateFieldIfNotNull("Orientation_g", event.gamma);
    // eventLoop();
  }

  function detectBopGenericAction(dataPoint) {
    if (
      dataPoint.acc_x > ACCEL_THRESHOLD ||
      dataPoint.acc_y > ACCEL_THRESHOLD ||
      dataPoint.acc_z > ACCEL_THRESHOLD
    ) {
      return true;
    }
  }

  function detectBopPull(dataPoint) {
    // Detect a -Y change in acceleration (Pull)
    if (dataPoint.acc_y < -5.0) {
      return true;
    }
    return false;
  }

  function detectBopTwist(dataPoint) {
    // Detect a -X and +Z or a +X and -Z change in the gyroscope (Twist)
    if (
      (dataPoint.gyro_x < -500.0 && dataPoint.gyro_z > 500.0) ||
      (dataPoint.gyro_x > 500.0 && dataPoint.gyro_z < -500.0)
    ) {
      return true;
    }
    return false;
  }

  function detectBopShake(dataPoint) {
    // Detect a -Y change in acceleration (Shake)
    if (dataPoint.acc_y < -1000.0) {
      return true;
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

    if (pullCounter > 15) {
      return ACTION_SHAKE;
    }
    if (twistCounter > 1) {
      return ACTION_TWIST;
    }
    if (pullCounter > 1) {
      return ACTION_PULL;
    }

    return ACTION_NONE;
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
    // for (i = recordingData.length - 1; i >= 0; i--) {
    //     if (detectBopGenericAction(recordingData[i])) {
    //         return;
    //     } if (now - recordingData[i].time > 100) {
    //         break;
    //     }
    // }
    if (now - startRecordingTime < 1000) {
      return;
    }

    // Read the data to figure out what the action was
    let action = readRecordedData();

    // Stop recording
    console.log("Recording stopped");
    document.getElementById("Recording").innerHTML = "No (stopped)";
    recordingData = [];
    isRecording = false;

    // Record the action
    document.getElementById("LastAction").innerHTML = action;
    guessPassword.push(action);

    // Check if the password is correct
    let isCorrect = true;
    for (let i = 0; i < guessPassword.length; i++) {
      if (guessPassword[i] != correctPassword[i]) {
        isCorrect = false;
        guessPassword = [];
        break;
      }
    }
    if (isCorrect && guessPassword.length == correctPassword.length) {
      document.getElementById("LastAction").innerHTML = "Correct Password!";
    }
  }

  function updateBuffer() {
    // Get the time difference between the first and last event in lastData
    let timeDifference = 0;
    if (lastData.length > 0) {
      timeDifference = lastData[lastData.length - 1].time - lastData[0].time;
      // document.getElementById("TimeDifference").innerHTML = timeDifference;
    }

    // Only keep a 100ms buffer in lastData
    if (timeDifference > RECORDING_TIME) {
      while (true) {
        let nextTimeDifference =
          lastData[lastData.length - 1].time - lastData[1].time;
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
      acc_gx: acc_gx,
      acc_gy: acc_gy,
      acc_gz: acc_gz,
      acc_x: acc_x,
      acc_y: acc_y,
      acc_z: acc_z,
      acc_i: acc_i,
      gyro_x: gyro_x,
      gyro_y: gyro_y,
      gyro_z: gyro_z,
      time: new Date().getTime(),
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

    // updateFieldIfNotNull(
    //   "Accelerometer_gx",
    //   event.accelerationIncludingGravity.x
    // );
    // updateFieldIfNotNull(
    //   "Accelerometer_gy",
    //   event.accelerationIncludingGravity.y
    // );
    // updateFieldIfNotNull(
    //   "Accelerometer_gz",
    //   event.accelerationIncludingGravity.z
    // );

    // updateFieldIfNotNull("Accelerometer_x", event.acceleration.x);
    // updateFieldIfNotNull("Accelerometer_y", event.acceleration.y);
    // updateFieldIfNotNull("Accelerometer_z", event.acceleration.z);

    // updateFieldIfNotNull("Accelerometer_i", event.interval, 2);

    // updateFieldIfNotNull("Gyroscope_z", event.rotationRate.alpha);
    // updateFieldIfNotNull("Gyroscope_x", event.rotationRate.beta);
    // updateFieldIfNotNull("Gyroscope_y", event.rotationRate.gamma);

    eventLoop();
  }

  // Call permission request on page load (iOS 13+ compatibility)
  window.addEventListener("load", function () {
    requestPermission();
  });

  // Event listeners for device motion and orientation (older versions or Android)
  window.addEventListener("deviceorientation", function (event) {
    handleOrientation(event);
  });

  window.addEventListener("devicemotion", function (event) {
    handleMotion(event);
  });
}

export default startMainCode;
