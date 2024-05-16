function toggleSpoiler() {
    var spoiler = document.querySelector(".spoiler-text");
    var button = document.querySelector(".spoiler-button");
    if (spoiler.style.display === "none") {
      spoiler.style.display = "block";
      button.style.display = "none"; // Hide the button after revealing the spoiler
    } else {
      spoiler.style.display = "none";
    }
  }

  document.addEventListener("DOMContentLoaded", function() {
    var customCursor = document.createElement("div");
    customCursor.classList.add("custom-cursor");
    document.body.appendChild(customCursor);
  
    document.addEventListener("mousemove", function(event) {
      customCursor.style.left = event.clientX + "px";
      customCursor.style.top = event.clientY + "px";
    });
  });
  
  

  function toggleSpoiler1() {
    var spoiler = document.querySelector(".spoiler-text1");
    var button = document.querySelector(".spoiler-button1"); // Selecting the first button
    if (spoiler.style.display === "none") {
      spoiler.style.display = "block";
      button.style.display = "none"; // Hide the button after revealing the spoiler
    } else {
      spoiler.style.display = "none";
    }
  }