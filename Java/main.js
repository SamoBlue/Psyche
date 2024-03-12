// Modified extractDominantColor function
function extractDominantColor(imagePath, callback, postId) {
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

      // Call the callback function with the dominant color and postId
      callback(dominantColor, postId);
  };
}

// Modify the applyTabColor function to apply the dominant color to the post element
function applyBackgroundColor(dominantColor, postId) {
  var post = document.querySelector("#post-image-" + postId).closest(".post");
  post.style.backgroundColor = "rgb(" + dominantColor + ")";
}

// Call the functions for each post when the document is ready
document.addEventListener("DOMContentLoaded", function() {
  var posts = document.querySelectorAll(".post-image");

  posts.forEach(function(postImage, index) {
      var imagePath = postImage.src; // Get the image path from the .post-image element
      extractDominantColor(imagePath, applyBackgroundColor, index);
  });
});


