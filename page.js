// const startMainCode = require("./script.js");
function updateTimeAndDate() {
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

// Update every second
setInterval(updateTimeAndDate, 1000);
updateTimeAndDate(); // Initial call

const swipeElement = document.getElementById("swipe");
console.log("🚀 ~ swipeElement:", swipeElement);

let startY = 0;
let endY = 0;
swipeElement.addEventListener("touchstart", () => {
  startY = event.touches[0].clientY;
});

// Listen for a 'swipe' gesture
swipeElement.addEventListener("touchend", () => {
  endY = event.changedTouches[0].clientY;

  // Check if swipe was upwards
  if (startY - endY > 50) {
    // Adjust threshold as needed
    handleSwipe();
  }
});

const handleSwipe = () => {
  console.log("Swipe detected!");
  document.getElementById("swipe").hidden = true;
  document.getElementById("Bop-It").style.display = "block";
  import("./script.js").then((module) => {
    console.log("🚀 ~ module:", module);
    module.default(); // Call the main code function
  });
};
