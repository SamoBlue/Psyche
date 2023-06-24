// Function to extract the dominant color from an image
function extractDominantColor(imagePath, callback) {
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imagePath;
    img.onload = function() {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      context.drawImage(img, 0, 0, img.width, img.height);
      var imageData = context.getImageData(0, 0, img.width, img.height).data;
      var colorCounts = {};
      var maxCount = 0;
      var dominantColor = null;
  
      for (var i = 0; i < imageData.length; i += 4) {
        var r = imageData[i];
        var g = imageData[i + 1];
        var b = imageData[i + 2];
        var rgb = r + "," + g + "," + b;
        if (colorCounts[rgb]) {
          colorCounts[rgb]++;
        } else {
          colorCounts[rgb] = 1;
        }
        if (colorCounts[rgb] > maxCount) {
          maxCount = colorCounts[rgb];
          dominantColor = rgb;
        }
      }
  
      callback(dominantColor);
    };
  }
  
  // Apply the dominant color to the tab
  function applyTabColor(dominantColor) {
    var tabs = document.querySelectorAll(".post-tab");
    tabs.forEach(function(tab) {
      tab.style.backgroundColor = "rgb(" + dominantColor + ")";
    });
  }
  
  // Call the functions when the document is ready
  document.addEventListener("DOMContentLoaded", function() {
    var imagePaths = ["path_to_image_1.jpg", "path_to_image_2.jpg"]; // Add image paths here
    imagePaths.forEach(function(imagePath) {
      extractDominantColor(imagePath, applyTabColor);
    });
  });
  