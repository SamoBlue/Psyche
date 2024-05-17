const clickSound = new Audio('audio/spookyclick.mp3');
let firstJumpScareActivated = false;

function playFirstJumpScare() {
  const scrollDistance = 900; // Fixed distance for each scroll
  const scrollIntervals = [200, 200, 200, 200, 200, 200, 200, 200, 200]; // Shorter intervals with additional setTimeouts

  clickSound.play();

  scrollIntervals.forEach((interval, index) => {
    setTimeout(() => {
      window.scrollBy(0, scrollDistance);
    }, interval * (index ));
  });

  firstJumpScareActivated = true;
}

function handler(entries) {
  for (entry of entries) {
    if (
      entry.target.id === 'firstTarget' &&
      entry.isIntersecting &&
      !firstJumpScareActivated
    ) {
      playFirstJumpScare();
    }
  }
}

function emojiClickChange() {
  document.getElementById('clickEmoji').innerText = "👻";
}

let observer = new IntersectionObserver(handler);
setTimeout(() => {
  observer.observe(document.getElementById('firstTarget'));
}, 3000);






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
  
  function toggleSpoiler2() {
    var spoiler = document.querySelector(".spoiler-text2");
    var button = document.querySelector(".spoiler-button2"); // Selecting the first button
    if (spoiler.style.display === "none") {
      spoiler.style.display = "block";
      button.style.display = "none"; // Hide the button after revealing the spoiler
    } else {
      spoiler.style.display = "none";
    }
  }
  function toggleSpoiler4() {
    var spoiler = document.querySelector(".spoiler-text4");
    var button = document.querySelector(".spoiler-button4");
    if (spoiler.style.display === "none") {
      spoiler.style.display = "block";
      button.style.display = "none";
    } else {
      spoiler.style.display = "none";
    }
  }
  
  function toggleSpoiler5() {
    var spoiler = document.querySelector(".spoiler-text5");
    var button = document.querySelector(".spoiler-button5");
    if (spoiler.style.display === "none") {
      spoiler.style.display = "block";
      button.style.display = "none";
    } else {
      spoiler.style.display = "none";
    }
  }
  
  function toggleSpoiler6() {
    var spoiler = document.querySelector(".spoiler-text6");
    var button = document.querySelector(".spoiler-button6");
    if (spoiler.style.display === "none") {
      spoiler.style.display = "block";
      button.style.display = "none";
    } else {
      spoiler.style.display = "none";
    }
  }

  function toggleSpoiler3() {
    var buttons = document.querySelectorAll(".spoiler-button3"); // Select all buttons with the class spoiler-button3
    var articles = document.querySelectorAll("article"); // Select all article elements

    buttons.forEach(function(button) {
        button.style.display = "none"; // Hide each button
    });

    articles.forEach(function(article) {
        article.style.display = "none"; // Hide each article
    });
}


  
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
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let interval = null;
  
  document.querySelector("h1").onmouseover = event => {  
    let iteration = 0;
    
    clearInterval(interval);
    
    interval = setInterval(() => {
      event.target.innerText = event.target.innerText
        .split("")
        .map((letter, index) => {
          if(index < iteration) {
            return event.target.dataset.value[index];
          }
        
          return letters[Math.floor(Math.random() * 26)]
        })
        .join("");
      
      if(iteration >= event.target.dataset.value.length){ 
        clearInterval(interval);
      }
      
      iteration += 1 / 7;
    }, 30);
  }