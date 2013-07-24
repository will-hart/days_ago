chrome.omnibox.onInputEntered.addListener(function(text) {
    // parse the text and save to storage
    
    chrome.tabs.create({url: 'index.html'}) 
});