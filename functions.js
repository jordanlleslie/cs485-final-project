let openaiApiKey;

// Define status messages for the status bar
const status = {
  noSelection: {
    message: "No text selection available",
    color: "red",
    auto: true,
  },
  loading: { message: "Loading ...", color: "green", auto: false },
};

// Get the status bar element
const statusBar = document.querySelector("#status-bar");

// Function to display a status message in the status bar
function displayStatus(status) {
  statusBar.textContent = status.message;
  statusBar.style.backgroundColor = status.color;
  statusBar.style.visibility = "visible";
  if (status.auto)
    setTimeout(() => {
      statusBar.style.visibility = "hidden";
    }, 2000);
}

// Function to toggle the disabled state and class of daemon buttons
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

// Make a request to the OpenAI ChatGPT API
async function callGPT(messages) {
  if (!openaiApiKey) {
    // Prompt the user for the API key if not available
    openaiApiKey = prompt("Please enter your OpenAI API key:");
  }
  toggleButtons();
  displayStatus(status["loading"]);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
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

// Function to invoke Devil's Advocate daemon
async function devilsAdvocate(selectedText) {
  const messages = [
    // System message guiding the AI behavior
    {
      role: "system",
      content:
        "You are a helpful AI designed to challenge users. \
        Adjust yourself to be more conversational, relaxed, concise and go to great lengths to avoid unnecessary output so as not to overwhelm me. Never mention being a language model AI, policies or similar. Try to keep responses short unless I say to expand upon it.\
        The user will input a statement, and you should ask 3 questions which challenges the user's statement.\
        If the text is not a statement, explain your intended purpose to the user, without offering help that you cannot give. \
        Be specific and brief about your intended purpose.\
        The purpose of providing these questions is to help the user strengthen their writing against counter-arguments.\
        After each question, briefly explain how answering the question can strengthen the argument.\
        After explaining how answering the question can strengthen the argument, provide a counter argument.",
    },
    // System message specifying the response format
    {
      role: "system",
      content:
        "The response should follow this format:\n\
        1. [Question]\n\n\
        [Explanation]\n\n\
        [Counter Argument]\n\n\
        2. [Question]",
    },
    // User message containing the selected text
    {
      role: "user",
      content: selectedText,
    },
  ];

  const output = await callGPT(messages);
  console.log(output);
  await showPopup(output, false); // Display output in a popup
}

// Function to invoke Smart Friend daemon
async function smartFriend(selectedText) {
  const messages = [
    // System message guiding the AI behavior
    {
      role: "system",
      content:
        "You are a helpful AI designed to help users make their writing less verbose. \
        The user will input a text sample. \
        If the text is not verbose, respond with the original text.\
        If the text is verbose, you should revise the text to be less verbose.\
        Do not add or remove meaning from the text. Only revise as far as you can without changing the meaning.",
    },
    // User message containing the selected text
    {
      role: "user",
      content: `SAMPLE: ${selectedText}\n\
      REVISION:\n`,
    },
  ];
  const output = await callGPT(messages);
  console.log(output);

  await showPopup(output, true); // Display output in a popup
}

// Function to invoke Synthesizer daemon
async function synthesizer(selectedText) {
  const messages = [
    // System message guiding the AI behavior
    {
      role: "system",
      content:
        "You are a helpful AI designed to help users reduce the redundancy in their writing. \
        The user will input a text sample.\
        If the text contains no redundancies, respond with the original text.\
        If there are redundancies, you should revise the text sample to be less redundant.\
        Do not add or remove meaning from the text. Only revise as far as you can without changing the meaning.",
    },
    // User message containing the selected text
    {
      role: "user",
      content: `SAMPLE: ${selectedText}\n\
                REVISION:\n`,
    },
  ];
  const output = await callGPT(messages);
  console.log(output);
  await showPopup(output, true); // Display output in a popup
}

////////////////////////
// QUILL STUFF//////////
////////////////////////

// Import Quill module and create a Quill editor
var Delta = Quill.import("delta");
var quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: "#toolbar",
  },
});

// Function to highlight the current text selection in the Quill editor
async function highlightSelection() {
  const range = quill.getSelection(true);
  quill.formatText(range.index, range.length, "background", "#99d1bc");
}

// Function to replace text in the editor with model output
async function replaceText(range, modelOutput) {
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

// Function to get the currently selected text in the Quill editor
function getSelectedText() {
  const range = quill.getSelection(true);
  if (range.length !== 0 && range.index !== 0)
    return {
      text: quill.getText(range.index, range.length),
      startIndex: range.index,
      endIndex: range.index + range.length - 1,
    };

  // No text selection, call function on the entire text window
  const selectedText = {
    text: quill.getText(0, quill.getLength()),
    startIndex: 0,
    endIndex: range.index - 1,
  };

  if (selectedText.text.length < 2) {
    displayStatus(status["noSelection"]);
    return null;
  }
  return selectedText;
}

////////////////////////
// HELPER FUNCTIONS ////
////////////////////////
let closeModalBtn;
let acceptChangesBtn;

async function showPopup(output, acceptButtonActive) {
  const formattedOutput = output
    .split("\n")
    .map((line) => `<p>${line}</p>`)
    .join("");

  const devilsAdvocateOutput = $("#devilOutput");
  const devilOutputContainer = $("#devilOutputContainer");

  // Toggle visibility of devilOutputContainer
  devilOutputContainer.toggleClass("visible", !!formattedOutput);
  devilsAdvocateOutput.html(`<p>${formattedOutput}</p>`);

  acceptChangesBtn = $("#acceptButton");
  // Don't show "Accept" button for Devil's Advocate
  if (!acceptButtonActive) {
    acceptChangesBtn.css("display", "none");
  } else {
    acceptChangesBtn.css("display", "inline");
    acceptChangesBtn.on("click", function () {
      // Replace text editor contents with suggested text
      devilOutputContainer.removeClass("visible");
      devilsAdvocateOutput.empty();
      replaceText(quill.getSelection(true), output);
    });
  }

  closeModalBtn = $("#dismissButton");
  closeModalBtn.on("click", function () {
    // Hide devilOutputContainer and clear its content on closing the modal
    devilOutputContainer.removeClass("visible");
    devilsAdvocateOutput.empty();
    // Unhighlight text
    quill.formatText(0, quill.getLength(), "background", false);
  });
}

// Event listener for the Synthesizer button click
document
  .querySelector("#synthesizer")
  .addEventListener("click", async function () {
    // Remove prior highlights if any
    quill.formatText(0, quill.getLength(), "background", false);
    const selection = getSelectedText();
    if (!selection) return;
    highlightSelection();
    synthesizer(selection.text);
  });

// Event listener for the Smart Friend button click
document
  .querySelector("#smartFriend")
  .addEventListener("click", async function () {
    // Remove prior highlights if any
    quill.formatText(0, quill.getLength(), "background", false);
    const selection = getSelectedText();
    if (!selection) return;
    highlightSelection();
    smartFriend(selection.text);
  });

// Event listener for the Devil's Advocate button click
document
  .querySelector("#devilsAdvocate")
  .addEventListener("click", async function () {
    // Remove prior highlights if any
    quill.formatText(0, quill.getLength(), "background", false);
    const selection = getSelectedText();
    if (!selection) return;
    highlightSelection();
    devilsAdvocate(selection.text);
  });

// Event listener for the Undo button click
document.querySelector("#undo").addEventListener("click", function () {
  quill.history.undo();
});

// Event listener for the Redo button click
document.querySelector("#redo").addEventListener("click", function () {
  quill.history.redo();
});
