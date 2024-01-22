async function updateCounters(selectedText) {
  const url = new URL("http://127.0.0.1:5000/hello");
  let fake_news = "";

  // Add query parameters
  url.searchParams.append("text", selectedText);

  try {
    const response = await fetch(url);
    fake_news = await response.text();
    console.log(fake_news);
  } catch (error) {
    console.error("Error:", error);
    fake_news = "Error fetching data"; // Handle error scenario
  }

  let wordcount = 0;
  let spacecount = 0;
  let sentcount = 0;
  let prevChar = "";

  if (selectedText) {
    // Trim trailing spaces
    selectedText = selectedText.trim();

    // initializing abbreviations
    function isAbbreviation(word, isEndOfSentence) {
      const abbreviations = [
        "Mr.",
        "Mrs.",
        "Dr.",
        "Prof.",
        "Ph.D.",
        "etc.",
        "e.g.",
        "i.e.",
        "Inc.",
        "Ltd.",
        "Jr.",
        "Sr.",
        "U.S.",
        "vb.",
        "vs.",
        "örn.",
        "Sn.",
        "A.Ş.",
        /[Aa]\.[Kk]\.[Aa]\./,
      ];

      const numberedListPattern = /^\d+\.\s*(?=[A-Z]|$)/;
      abbreviations.push(numberedListPattern);

      return abbreviations.some((abbr) => {
        if (abbr instanceof RegExp) {
          return (
            abbr.test(word) &&
            !(isEndOfSentence && abbr === numberedListPattern)
          );
        } else {
          return (
            abbr === word && !(isEndOfSentence && abbr === numberedListPattern)
          );
        }
      });
    }
    function isNameAbbreviation(word) {
      const nameAbbreviations = [
        "A.",
        "B.",
        "C.",
        "Ç.",
        "D.",
        "E.",
        "F.",
        "G.",
        "H.",
        "I.",
        "İ.",
        "J.",
        "K.",
        "L.",
        "M.",
        "N.",
        "O.",
        "Ö.",
        "P.",
        "R.",
        "S.",
        "Ş.",
        "T.",
        "U.",
        "Ü.",
        "V.",
        "Y.",
        "Z.",
        "X.",
        "W.",
        "Q.",
      ];
      return nameAbbreviations.includes(word);
    }

    // Split the selected text into words
    const words = selectedText.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check if the word is an abbreviation
      if (
        isAbbreviation(word, i === words.length - 1) ||
        isNameAbbreviation(word)
      ) {
        // Decrement sentence count if abbreviation is found
        sentcount--;
      }
    }

    for (let i = 0; i < selectedText.length; i++) {
      if (selectedText[i] === " ") {
        if (selectedText[i + 1] !== " ") {
          wordcount++;
        }
        spacecount++;
      }

      if (
        selectedText[i] === "." ||
        selectedText[i] === "!" ||
        selectedText[i] === "?"
      ) {
        // check the sentence is finished or not
        if (i + 1 < selectedText.length && selectedText[i + 1] === " ") {
          // control for abbreviation with uppercase
          if (
            i - 1 >= 0 &&
            selectedText[i - 1].match(/[A-Z]/) &&
            i + 2 < selectedText.length
          ) {
            const nextWord = selectedText.substring(i + 2).split(" ", 1)[0];
            if (!isAbbreviation(nextWord)) {
              sentcount++;
            } else {
              // Decrement sentence count if abbreviation is found
              sentcount--;
            }
          } else if (
            i + 1 < selectedText.length &&
            selectedText[i + 1].match(/[A-Z]/)
          ) {
            const nextWord = selectedText.substring(i + 1).split(" ", 1)[0];
            if (!isAbbreviation(nextWord)) {
              sentcount++;
            } else {
              // Decrement sentence count if abbreviation is found
              sentcount--;
            }
          } else {
            sentcount++;
          }
        }
      }

      prevChar = selectedText[i];
    }

    // If the text is not empty and there is a word check the punctuation at the end of the last word
    if (selectedText.length > 0) {
      const lastWord = selectedText.split(" ").pop();
      if (
        lastWord.endsWith(".") ||
        lastWord.endsWith("!") ||
        lastWord.endsWith("?")
      ) {
        sentcount++;
      }
    }
  }

  // Send the counters back to the popup
  chrome.runtime.sendMessage({
    action: "updatePopup",
    counters: {
      space: spacecount,
      chars: selectedText ? selectedText.length : 0,
      charsws: selectedText ? selectedText.replace(/\s/g, "").length : 0,
      words: selectedText ? (selectedText.length === 0 ? 0 : wordcount + 1) : 0,
      sentences: sentcount,
      fakeNewsScore: fake_news,
      selectedText: selectedText,
    },
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString();
    updateCounters(selectedText);
  }
});
