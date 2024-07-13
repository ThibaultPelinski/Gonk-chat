document.addEventListener('DOMContentLoaded', initializeForm);
// Check if the browser is Firefox
 

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openPopup") {
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 400,
      height: 300
    });
  }
});

if (typeof InstallTrigger !== 'undefined') {
  // Firefox-specific code
  browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url.includes('mail.google.com')) {
      browser.tabs.executeScript(tabId, {
        file: 'content.js'
      });
    }
  });
} else {
  // Chrome-specific code
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url.includes('mail.google.com')) {
      chrome.tabs.executeScript(tabId, {
        file: 'content.js'
      });
    }
  });
}


function initializeForm() {
  let form = document.getElementById('api-key-form');
  if (!form) {
    form = createForm();
    document.body.appendChild(form);
  }
  const apiKeyInput = document.getElementById('api-key');
  const storedApiKey = localStorage.getItem('apiKey');
  if (storedApiKey) {
    setApiKey(apiKeyInput, storedApiKey);
  }
  form.addEventListener('submit', handleSubmit);
  const submitButton = document.getElementById('submit-button');
  submitButton.addEventListener('click', handleSubmitButtonClick);
}

function createForm() {
  const form = document.createElement('form');
  form.id = 'api-key-form';
  form.innerHTML = `
    <form id="api-key-form"  accept-charset="UTF-8">
      <label for="api-key">API Key:</label>
    <input type="text" id="api-key" name="api-key">
    <label for="api-text">API Text:</label>
    <button type="submit">Submit</button>
    <textarea id="api-text" name="api-text"></textarea>
  <button id="submit-button">Submit Text</button>
  </form>
  <p id="api-key-status"></p>
  <p id="api-response"></p>
  `;
  return form;
}

function setApiKey(input, key) {
  input.value = key;
  input.disabled = true;
}

function handleSubmit(event) {
  event.preventDefault();
  const apiKey = document.getElementById('api-key').value;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  showLoader();
  fetch('https://api.mistral.ai/v1/models', {
    method: 'GET',
    headers: headers
  })
  .then(handleResponse)
  .catch(handleError)
  .finally(hideLoader);
}

function handleResponse(response) {
  if (response.ok) {
    document.getElementById('api-key-status').textContent = 'API key is valid';
    localStorage.setItem('apiKey', document.getElementById('api-key').value);
    document.getElementById('api-key').disabled = true;
  } else {
    document.getElementById('api-key-status').textContent = 'API key is invalid';
  }
}

function handleError(error) {
  console.error(error);
  document.getElementById('api-key-status').textContent = 'An error occurred';
}

function handleSubmitButtonClick() {
  const textareaContent = document.getElementById('api-text').value;
  if (textareaContent) {
      sendRequestToApi(textareaContent);
  }
}
 
function openExtension() {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 400,
    height: 300
  });
}

function sendRequestToApi(selectedText) {
  const apiKey = document.getElementById('api-key').value;
  const data = {
    model: 'mistral-small',
    messages: [
        {
            role: 'user',
            content: selectedText
        }
    ],
};
  const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
  };

  showLoader();
  fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
      const responseElement = document.getElementById('api-response');
      responseElement.textContent = data.choices[0].message.content;

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "injectText", text: data.choices[0].message.content });
      });
  })
  .catch(error => {
      console.error(error);
      const responseElement = document.getElementById('api-response');
      responseElement.textContent = 'An error occurred';
  })
  .finally(hideLoader);
}

function showLoader() {
  const loader = document.getElementById('loader');
  loader.style.display = 'block';
}

function hideLoader() {
  const loader = document.getElementById('loader');
  loader.style.display = 'none';
}


if (typeof chrome !== 'undefined' && chrome.commands) {
  chrome.commands.onCommand.addListener(command => {
    if (command === 'open_extension') {
      openExtension();
    }
  });
}



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openPopup") {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    }
  }
});
