// Créez un nouvel élément image
var img = document.createElement("img");
img.src = chrome.runtime.getURL("icon/gonk.jpg");
img.style.position = "fixed";
img.style.bottom = "10px";
img.style.right = "10px";
img.style.width = "50px";
img.style.height = "50px";
img.style.zIndex = "1000"; // Assurez-vous qu'il soit au-dessus des autres éléments

// Ajoutez l'image au corps du document
document.body.appendChild(img);

// Ajoutez un écouteur de clic pour envoyer un message au script d'arrière-plan
img.addEventListener("click", function() {
  chrome.runtime.sendMessage({ action: "openPopup" });

});

function injectTextIntoGmail(text) {
    // Try to find the Gmail reply box with class 'Am aiL'
    const replyBox = document.querySelector('div.Am.al.editable');
    if (replyBox) {
        replyBox.focus(); // Make sure the reply box is focused before inserting text
        document.execCommand('insertText', false, text);
        console.log("Text injected into Gmail reply box.");
    } else {
        console.error("Reply box not found.");
    }
}

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "injectText" && request.text) {
        injectTextIntoGmail(request.text);
    }
});