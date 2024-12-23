const CONFIG = {
    storageName: "ixjb94_leverage_popup",
}

document.addEventListener("DOMContentLoaded", () => {
    const maxLossInput = document.getElementById("maxLoss");
    const feeInput = document.getElementById("fee");
    const saveButton = document.getElementById("saveButton");

    // Load localStorage
    chrome.storage.local.get([CONFIG.storageName]).then((value) => {
        if (typeof value == "object") {
            const { fee, maxLoss } = value[CONFIG.storageName]
            maxLossInput.value = maxLoss
            feeInput.value = fee
        }
    })

    // Save localStorage --- Send Data
    saveButton.addEventListener("click", () => {
        
        const value = {
            maxLoss: maxLossInput.value,
            fee: feeInput.value,
        };
        
        chrome.storage.local.set({ [CONFIG.storageName]: value })
        
        // Send -> content.js
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { message: value });
            }
        });
    });
});
