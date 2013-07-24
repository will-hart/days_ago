chrome.omnibox.onInputEntered.addListener(function(text) {
    // parse the text and save to storage
    chrome.tabs.create({url: 'more.html'})
    
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent('daysAgoSearch', true, true, text);
    window.dispatchEvent(evt);
});