// Add an event listener to the 'callApiButton' element
document.getElementById('callApiButton').addEventListener('click', () => {
  // Get the value of the 'inputData' element
  const inputData = document.getElementById('inputData').value;

  // Send a message to the browser runtime with the type 'CALL_API' and the input data as the prompt
  browser.runtime.sendMessage({ type: 'CALL_API', prompt: inputData })
    .then(response => {
      // If the response contains an error, display the error message in the 'responseOutput' element
      if (response.error) {
        document.getElementById('responseOutput').textContent = `Error: ${response.error}`;
      } else {
        // If the response is successful, display the result in the 'responseOutput' element
        document.getElementById('responseOutput').textContent = response.result;
      }
    })
    .catch(error => {
      // If there is an error in the sendMessage function, display the error message in the 'responseOutput' element
      document.getElementById('responseOutput').textContent = `Error: ${error}`;
    });
});
