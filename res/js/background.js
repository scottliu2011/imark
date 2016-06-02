
//init sync storage
chrome.storage.sync.get('sync', function(result) {
  if (!result.sync) {
    var sync = {
      config: {
        id: 0
      },
      marks: []
    };
    chrome.storage.sync.set({sync: sync});
  }
});

//show edit window
var callEditWindow = function(info, tab) {
  var selectionText = info.selectionText;
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {selectionText: selectionText}, function(response) {});
  });
};

//add iMark icon to context menu
chrome.contextMenus.create({
    id: 'imark-context-menu',
    type: 'normal',
    title: 'iMark it',
    contexts: ['selection'],
    onclick: callEditWindow
});
