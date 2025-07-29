/* **SUPER IMPORTANT**  PUT THE URL OF THE JSON FILE WHERE YOU INSERTED ALL YOUR DATA HERE !! */
const vnData = 'Java/VNData.json';

// Creates the HTML and inserts it into the document 
function insertHTML() {
    return `
        <div id='mainbox'>
            <div id='spritebox' class='rightalign'>
                <img src=''>
            </div>
            <div id='namebox'>
                <span>Loading...</span>
            </div>
            <div id='textbox'>
                <p>Loading...</p>
                <div id='optionsbox'></div>
            </div>
            <button id="nextButton">Next</button>
        </div>
    `;
}

const htmlData = insertHTML();
document.getElementById('VisualNovelEngine').insertAdjacentHTML("beforebegin", htmlData);

// Creates constants based off of the HTML created
const $textbox = document.querySelector("#textbox p");
const $optionsbox = document.querySelector('#optionsbox');
const $namebox = document.querySelector("#namebox span");
const $spritebox = document.querySelector("#spritebox img");
const $mainbox = document.querySelector('#mainbox');
const $nextButton = document.querySelector('#nextButton');

let json, to;

//Tracks what "Page Number" the user is on
var pageNum = 0;
var currentPage;

// Add CSS for fixed size and styling (NOW CENTERED)
const style = document.createElement('style');
style.textContent = `
    #mainbox {
        width: 800px;
        height: 600px;
        margin: 50px auto; /* Centers horizontally and adds top spacing */
        position: relative;
        background-size: cover;
        background-position: center;
        border: 2px solid #333;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    #spritebox {
        position: absolute;
        bottom: 100px;
        right: 20px;
        max-width: 300px;
        max-height: 400px;
    }
    #spritebox img {
        max-width: 100%;
        max-height: 100%;
    }
    #namebox {
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px;
        border-radius: 5px;
    }
    #textbox {
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 15px;
        border-radius: 5px;
        min-height: 100px;
    }
    #optionsbox {
        margin-top: 10px;
    }
    #optionsbox div {
        background: rgba(50, 50, 200, 0.7);
        color: white;
        padding: 8px;
        margin: 5px 0;
        border-radius: 3px;
        cursor: pointer;
    }
    #optionsbox div:hover {
        background: rgba(70, 70, 220, 0.9);
    }
    #nextButton {
        position: absolute;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    #nextButton:hover {
        background: #45a049;
    }
`;
document.head.appendChild(style);

async function grabData() {
    // Load the data
    const resp = await fetch(vnData);
    json = await resp.json();
    
    currentPage = Object.keys(json.Scene1.PAGES)[pageNum];
    
    // Initialize the data 
    initialize(json);
    handleOptions(json);
}

// Initializes the data & also handles page turning 
async function initialize(data) {
    // Clean it all
    $spritebox.src = '';
    $namebox.innerText = '';
    $textbox.innerText = ''; 
    
    // Update UI based on the current page
    $spritebox.src = data.Characters[data.Scene1.PAGES[currentPage].Character][data.Scene1.PAGES[currentPage].Sprite];
    $namebox.innerText = data.Scene1.PAGES[currentPage].Character;
    typeWriter(data.Scene1.PAGES[currentPage].PageText);
    $mainbox.style.backgroundImage = "url(" + data.Scene1.Background + ")"; 
}

function handleOptions(data) {
    // Clean it out
    $optionsbox.innerHTML = "";

    if (data.Scene1.PAGES[currentPage].hasOwnProperty('Options')) {
        var o = data.Scene1.PAGES[currentPage].Options;
        Object.keys(o).forEach(k => {
            const row = document.createElement('div');
            row.innerHTML = `${k}`;
            $optionsbox.appendChild(row);
            row.addEventListener('click', () => { 
                currentPage = o[k];
                pageNum = Object.keys(json.Scene1.PAGES).indexOf(currentPage);
                initialize(json); 
                $optionsbox.innerHTML = "";
            });
        });
    }
}

// Typewriter Effect 
function typeWriter(txt, i) {
    i = i || 0;
    if (!i) {
        $textbox.innerHTML = '';
        clearTimeout(to);
    }
    var speed = 30; // The speed/duration of the effect in milliseconds
    if (i < txt.length) {
        var c = txt.charAt(i++);
        if (c === ' ') c = '&nbsp;';
        $textbox.innerHTML += c;
        to = setTimeout(function() {
            typeWriter(txt, i);
        }, speed);
    }
}

function checkPage(data) {
    if (data.Scene1.PAGES[currentPage].hasOwnProperty('Options')) return false;
    if (data.Scene1.PAGES[currentPage].hasOwnProperty('NextPage')) {
        if (data.Scene1.PAGES[currentPage].NextPage == "End") return false;
    }
    return true;
}

// Go to the next page
function nextPage() {
    if (!json) return;
    if (checkPage(json)) {
        if (json.Scene1.PAGES[currentPage].hasOwnProperty('NextPage')) {
            currentPage = json.Scene1.PAGES[currentPage].NextPage;
        } else {
            pageNum++;
            currentPage = Object.keys(json.Scene1.PAGES)[pageNum];
        }
        initialize(json);
        handleOptions(json);
    }
}

// Next button click handler
$nextButton.addEventListener('click', nextPage);

// Space key navigation
document.addEventListener('keydown', (e) => {
    if (e.key === " ") {
        e.preventDefault(); // Prevent scrolling with space
        nextPage();
    }
});

// Fetch the JSON data
grabData();

function nextPage() {
    if (!json) return;
    
    if (checkPage(json)) {
        if (json.Scene1.PAGES[currentPage].hasOwnProperty('NextPage')) {
            const next = json.Scene1.PAGES[currentPage].NextPage;
            if (!json.Scene1.PAGES[next]) {
                console.error("Missing page:", next);
                return;
            }
            currentPage = next;
        } else {
            pageNum++;
            currentPage = Object.keys(json.Scene1.PAGES)[pageNum];
            if (!currentPage) {
                console.log("End of story");
                return;
            }
        }
        initialize(json);
        handleOptions(json);
    }
}