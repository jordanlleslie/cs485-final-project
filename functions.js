////////////////////////
// API STUFF ///////////
////////////////////////

// Make a request to the OpenAI ChatGPT API
async function fetchData(prompt) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer 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", // Replace with your actual API key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices[0].message.content;
    return message;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

async function call_gpt() {
  let range = quill.getSelection(true);
  const text = quill.getText(range.index, range.length);
  const message = await fetchData(text);
  if (message) {
    console.log(message);
    updateEditor(range, message);
  }
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
