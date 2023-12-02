const status = {
  noSelection: {
    message: "No text selection available",
    color: "red",
    auto: true,
  },
  loading: { message: "Loading ...", color: "green", auto: false },
};

const statusBar = document.querySelector("#status-bar");

function displayStatus(status) {
  statusBar.textContent = status.message;
  statusBar.style.backgroundColor = status.color;
  statusBar.style.visibility = "visible";
  if (status.auto)
    setTimeout(() => {
      statusBar.style.visibility = "hidden";
    }, 2000);
}

function toggleButtons() {
  const daemons = document.querySelectorAll(".daemon");
  daemons.forEach((daemon) => {
    daemon.disabled = !daemon.disabled;
    daemon.classList.toggle("disabled-daemon");
  });
}

////////////////////////
// API STUFF ///////////
////////////////////////

import { OPENAI_API_KEY } from "./config.js";

// Make a request to the OpenAI ChatGPT API
async function callGPT(messages) {
  toggleButtons();
  displayStatus(status["loading"]);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
      }),
    });

    statusBar.style.visibility = "hidden";
    toggleButtons();

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

async function devilsAdvocate(selectedText) {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful AI designed to challenge users. The user will input a statement, and you should ask 3 question which challenges the user's statement. \
        Ask the questions and provide a response to each question in a way that will help the user strengthen their argument. ",
    },
    {
      role: "user",
      content: selectedText,
    },
  ];

  const output = await callGPT(messages);
  console.log(output);
}

async function smartFriend(selectedText) {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful AI designed to help users make their writing less verbose. \
        the user will input text, and you should revise the text to be less verbose while \
        retaining the original meaning of the text. If the text is not verbose, do not make any \
        changes, and respond with the original text only.",
    },
    {
      role: "user",
      content: selectedText,
    },
  ];
  const output = await callGPT(messages);
  replaceText(quill.getSelection(true), output);
}

async function synthesizer(selectedText) {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful AI designed to help users reduce the redundancy in their writing. \
        The user will input a text sample, and you should revise the text sample to be less redundant, \
        without removing any meaning from the text. \
        If the text contains no redundancies, respond with the original text only.",
    },
    {
      role: "user",
      content: selectedText,
    },
  ];
  const output = await callGPT(messages);
  replaceText(quill.getSelection(true), output);
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

async function replaceText(range, modelOutput) {
  /*
  Replace text in editor directly with model output
  */

  let targetLength = range.length;
  let targetIndex = range.index;

  if (targetLength === 0) {
    targetLength = targetIndex;
    targetIndex = 0;
  }

  // Replace original text with suggestion
  quill.updateContents(
    new Delta().retain(targetIndex).delete(targetLength).insert(modelOutput)
  );
}

function getSelectedText() {
  const range = quill.getSelection(true);

  if (range.length !== 0)
    return {
      text: quill.getText(range.index, range.length),
      startIndex: range.index,
      endIndex: range.index + range.length - 1,
    };

  // No text selection, call function on entire text window
  const selectedText = {
    text: quill.getText(0, range.index),
    startIndex: 0,
    endIndex: range.index - 1,
  };

  if (selectedText.text.length === 0) {
    displayStatus(status["noSelection"]);
    return null;
  }
  return selectedText;
}

////////////////////////
// HELPER FUNCTIONS ////
////////////////////////

function showPopup(selectionInfo) {
  // Get the modal element
  const modal = document.getElementById("myModal");
  console.log("selection info: " + selectionInfo);
  const endBounds = quill.getBounds(selectionInfo);
  const top = endBounds.bottom + window.scrollY + "px";
  const left = endBounds.left + window.scrollX + "px";

  // Set the position of the modal
  modal.style.top = top;
  modal.style.left = left;

  // Display the text and position info in the modal
  modal.innerHTML = `<p>Selected Text: ${"i"}</p>
                     <p>Start Index: ${"am"}</p>
                     <p>End Index: ${"mad"}</p>`;

  // Display the modal
  modal.style.display = "block";
}

document
  .querySelector("#synthesizer")
  .addEventListener("click", async function () {
    const selection = getSelectedText();
    if (!selection) return;
    synthesizer(selection.text);
  });

document
  .querySelector("#smartFriend")
  .addEventListener("click", async function () {
    const selection = getSelectedText();
    if (!selection) return;
    smartFriend(selection.text);
  });

document
  .querySelector("#devilsAdvocate")
  .addEventListener("click", async function () {
    const selection = getSelectedText();
    if (!selection) return;
    const selectedTextEndRange = selection.endIndex;
    devilsAdvocate(selection.text);
    showPopup(selectedTextEndRange);
  });

document.querySelector("#undo").addEventListener("click", function () {
  quill.history.undo();
});

document.querySelector("#redo").addEventListener("click", function () {
  quill.history.redo();
});
