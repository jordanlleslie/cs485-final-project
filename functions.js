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
  quill.updateContents(
    new Delta()
      .retain(range.index + range.length + 1)
      .insert("\n")
      .insert(modelOutput)
      .insert("\n\n")
      .insert("Accept")
  );
}

document
  .querySelector("#myButton")
  .addEventListener("click", async function () {
    let range = quill.getSelection(true);
    const modelOutput = call_gpt();
  });

document
  .querySelector("#myButton1")
  .addEventListener("click", async function () {
    let range = quill.getSelection(true);
    const modelOutput = call_gpt();
  });

document
  .querySelector("#myButton2")
  .addEventListener("click", async function () {
    let range = quill.getSelection(true);
    const modelOutput = call_gpt();
  });
