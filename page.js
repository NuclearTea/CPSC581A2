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

// Listen for a 'swipe' gesture
swipeElement.addEventListener("click", () => {
  console.log("Swipe detected!");
  document.getElementById("swipe").innerHTML = "Unlocked"; // Optional message
  import("./script.js").then((module) => {
    console.log("🚀 ~ module:", module);
    module.default(); // Call the main code function
  });
});
