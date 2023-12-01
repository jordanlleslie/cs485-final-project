////////////////////////
// API STUFF ///////////
////////////////////////

function call_gpt() {
  /*
  TODO: Update this to call GPT with prompt
  */
  let message = "default";
  const xhr = new XMLHttpRequest();
  // Set the request method and URL.
  xhr.open("GET", "https://mocki.io/v1/baff67f5-4af8-4d62-86ad-f49d75ce98fc");

  // Set the request header.
  xhr.setRequestHeader("Accept", "application/json");

  // Send the request.
  xhr.send();

  // Listen for the response.
  xhr.onload = function () {
    if (xhr.status === 200) {
      // Success!
      const response = JSON.parse(xhr.responseText);
      message = response.data;
      let range = quill.getSelection(true);
      updateEditor(range, message);
      // console.log(findText());
    } else {
      // Error!
      console.error(xhr.statusText);
      message = null;
    }
  };
  return message;
}

////////////////////////
// QUILL STUFF//////////
////////////////////////

var Delta = Quill.import("delta");

var quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: "#toolbar",
  },
});

async function updateEditor(range, modelOutput) {
  /*
  Update editor with suggested message, accept/deny buttons
  */

  const targetLength = range.length;
  const targetIndex = range.index;

  const totalLength = quill.getLength() - 1;

  modelOutput = "This is a test";

  // TODO: UI for user input accepting/rejecting suggestion, then remove UI after accept/reject
  let accepted = 1;
  if (accepted) {
    // Replace original text with suggestion
    quill.updateContents(
      new Delta().retain(targetIndex).delete(targetLength).insert(modelOutput)
    );
  }
}

document
  .querySelector("#myButton")
  .addEventListener("click", async function () {
    const modelOutput = call_gpt();
  });

document
  .querySelector("#myButton1")
  .addEventListener("click", async function () {
    const modelOutput = call_gpt();
  });

document
  .querySelector("#myButton2")
  .addEventListener("click", async function () {
    const modelOutput = call_gpt();
  });
