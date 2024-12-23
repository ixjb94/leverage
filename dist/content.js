const CONFIG = {
    divName: "ixjb94_leverage",
    localStorage: "ixjb94_leverage_divPosition",
    localStoragePopup: "ixjb94_leverage_popup",
}

// styles
const styles = document.createElement("style")
styles.innerHTML = `
.draggableDiv {
    position: fixed;
    z-index: 9999;
    border: 1px solid #000;
    cursor: move;
    font-family: monospace;
    user-select: none;
    background: white;
}
.red {
    color: red;
}
.results {
    margin-bottom: 5px;
    background: #e01313;
    color: white;
    text-align: center;
    padding: 5px;
}
.stopLoss {
    border-radius: 0px;
    border: 1px solid;
    font-size: 12px;
    outline: unset;
    font-family: monospace;
    border-color: #999;
    margin: 5px;
    padding: 5px;
    color: black;
}
.mt5 {
    margin-top: 5px;
}
.calc {
    background: #e01313;
    color: white;
    font-size: 10px;
    border: unset;
    font-family: monospace;
    cursor: pointer;
    width: 100%;
    padding: 5px;
}
.stopLoss::selection {
    background: red;
    color: white;
}
`
document.body.appendChild(styles)

// main element
const draggableDiv = document.createElement("div");
draggableDiv.id = CONFIG.divName;
draggableDiv.className = "draggableDiv";
draggableDiv.innerHTML = `
    <div class="results"> Leverage: 0 </div>
    <div class="content">
        <input id="stopLoss" class="stopLoss" type="text" placeholder="Stop Loss %" />
        <div class="mt5">
            <button id="calculate" class="calc"> Calculate </button>
        </div>
    </div>
`
document.body.appendChild(draggableDiv);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    if (request.message) {
        let { maxLoss, fee } = request.message
        maxLoss = Number(maxLoss)
        fee     = Number(fee)

        localStorage.setItem(CONFIG.localStoragePopup, JSON.stringify({maxLoss, fee}))

        // recalculate in case
        calculate()
    }
});

const savedPosition = localStorage.getItem(CONFIG.localStorage);
if (savedPosition) {
    const { top, left } = JSON.parse(savedPosition);
    draggableDiv.style.top = `${top}px`;
    draggableDiv.style.left = `${left}px`;
} else {
    // Default position
    draggableDiv.style.top = "10px";
    draggableDiv.style.left = "10px";
}

document.body.appendChild(draggableDiv);

let isDragging = false;
let offsetX, offsetY;

draggableDiv.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - draggableDiv.offsetLeft;
    offsetY = event.clientY - draggableDiv.offsetTop;
    draggableDiv.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        const newLeft = event.clientX - offsetX;
        const newTop = event.clientY - offsetY;
        draggableDiv.style.left = `${newLeft}px`;
        draggableDiv.style.top = `${newTop}px`;
    }
});

document.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        draggableDiv.style.cursor = "move";

        // Save the position to localStorage
        const position = {
            top: parseInt(draggableDiv.style.top, 10),
            left: parseInt(draggableDiv.style.left, 10),
        };

        localStorage.setItem(CONFIG.localStorage, JSON.stringify(position));
    }
});

/**
 * @param {number} maxLoss 
 * @param {number} fee 
 * @returns Calculate Leverage
 */
function leverage() {
    const stopLossInput = document.getElementById("stopLoss")
    const stopLoss = Number(stopLossInput.value)

    
    let maxLoss = 1;
    let fee = 0;
    
    let LS = localStorage.getItem(CONFIG.localStoragePopup)
    if (LS) {
        LS = JSON.parse(LS)
        maxLoss = LS.maxLoss
        fee = LS.fee
    }
    
    const bads = Number(stopLoss) + Number(fee)
    return Math.floor(maxLoss / bads)
}

function calculate() {
    const x = leverage()
    const resultsElement = document.querySelector(".results")
    resultsElement.innerHTML = `Leverage: ${x}`
}

const calculateButton = document.getElementById("calculate")
calculateButton.addEventListener("click", (event) => {
    calculate()
})

document.addEventListener("keypress", (event) => {
    if (event.key == "Enter") {
        calculate()
    }
})

const stopLossInput = document.getElementById("stopLoss")
stopLossInput.addEventListener("focus", () => stopLossInput.select())