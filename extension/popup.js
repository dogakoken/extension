// Execute the content script and get the selected text
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.executeScript(tabs[0].id, { file: "wordcount.js" }, function () {
    // Send a message to the content script to get the selected text
    chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" });
  });
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === "updatePopup") {
    console.log("Received updatePopup message:", request);
    const counters = request.counters;
    const fakeNewsScore = request.fakeNewsScore;

    //Update other counters as before
    updatePopup(counters);
  }
});

function updatePopup(counters) {
  const spaceElem = document.getElementById("space");
  const charsElem = document.getElementById("chars");
  const charswsElem = document.getElementById("charsws");
  const wordsElem = document.getElementById("words");
  const sentencesElem = document.getElementById("sentences");
  const fakeNewsLabelElem = document.getElementById("fakeNewsLabel");
  const fakeNewsProbabilityElem = document.getElementById(
    "fakeNewsProbability"
  );
  const selectedTextElem = document.getElementById("selectedText");

  if (counters) {
    spaceElem.textContent = counters.space;
    charsElem.textContent = counters.chars;
    charswsElem.textContent = counters.charsws;
    wordsElem.textContent = counters.words;
    sentencesElem.textContent = counters.sentences;
    const [label, probability] = counters.fakeNewsScore.split("\n");
    selectedTextElem.textContent = counters.selectedText || "N/A";
    // Update fake news label and probability elements
    fakeNewsLabelElem.textContent = label || "N/A";
    fakeNewsProbabilityElem.textContent = probability || "N/A";

    fakeNewsLabelElem.classList.remove(
      "fake-news-label-real",
      "fake-news-label-fake"
    );
    fakeNewsLabelElem.classList.add(`fake-news-label-${label.toLowerCase()}`);

    selectedTextElem.style.color =
      label === "real" ? "rgb(29, 215, 29)" : "red";

    const probabilityValue = parseFloat(probability);
    if (!isNaN(probabilityValue)) {
      let iconHtml = "";
      let iconColor = "";

      if (label === "real") {
        // star icon for real news
        if (probabilityValue >= 0.9) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "green";
        } else if (probabilityValue >= 0.8 && probabilityValue < 0.9) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "green";
        } else if (probabilityValue >= 0.7 && probabilityValue < 0.8) {
          iconHtml =
            '<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "green";
        } else if (probabilityValue >= 0.6 && probabilityValue < 0.7) {
          iconHtml = '<i class="fas fa-star"></i><i class="fas fa-star"></i>';
          iconColor = "green";
        } else if (probabilityValue >= 0.5 && probabilityValue < 0.6) {
          iconHtml = '<i class="fas fa-star"></i>';
          iconColor = "green";
        }
      } else if (label === "fake") {
        // danger icon for fake news
        if (probabilityValue >= 0.9) {
          // 5 "danger" icons
          iconHtml =
            '<i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i>';
          iconColor = "red";
        } else if (probabilityValue >= 0.8 && probabilityValue < 0.9) {
          iconHtml =
            '<i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i>';
          iconColor = "red";
        } else if (probabilityValue >= 0.7 && probabilityValue < 0.8) {
          iconHtml =
            '<i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i>';
          iconColor = "red";
        } else if (probabilityValue >= 0.6 && probabilityValue < 0.7) {
          iconHtml =
            '<i class="fas fa-exclamation-triangle"></i><i class="fas fa-exclamation-triangle"></i>';
          iconColor = "red";
        } else if (probabilityValue >= 0.5 && probabilityValue < 0.6) {
          // 1 "danger" icon
          iconHtml = '<i class="fas fa-exclamation-triangle"></i>';
          iconColor = "red";
        }
      }

      // Set the inner HTML of fakeNewsProbabilityElem directly
      fakeNewsProbabilityElem.innerHTML = `<span style="color: ${iconColor}">${iconHtml}</span>`;
    } else {
      fakeNewsProbabilityElem.textContent = "N/A";
    }
  } else {
    // Handle the case where no text is selected
    spaceElem.textContent = 0;
    charsElem.textContent = 0;
    charswsElem.textContent = 0;
    wordsElem.textContent = 0;
    sentencesElem.textContent = 0;
    fakeNewsLabelElem.textContent = "N/A";
    fakeNewsProbabilityElem.textContent = "N/A";
    fakeNewsLabelElem.classList.remove(
      "fake-news-label-real",
      "fake-news-label-fake"
    );
    selectedTextElem.textContent = "N/A";
    selectedTextElem.style.color = "black";
  }
}
