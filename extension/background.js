const contextMenuItemId = "analyzeSelectedText";

chrome.contextMenus.remove(contextMenuItemId, function () {
  chrome.contextMenus.create({
    id: contextMenuItemId,
    title: "Open Fake News Detector",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === contextMenuItemId) {
    const selectedText = info.selectionText;

    chrome.tabs.create(
      {
        url:
          chrome.runtime.getURL("popup.html") +
          "?selectedText=" +
          encodeURIComponent(selectedText),
        active: false,
      },
      function (createdTab) {
        chrome.tabs.onUpdated.addListener(function onTabUpdated(
          tabId,
          changeInfo
        ) {
          if (tabId === createdTab.id && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onTabUpdated);
            chrome.tabs.update(tabId, { active: true });
          }
        });
      }
    );
  }
});
