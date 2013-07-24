var evt = document.createEvent('Event');
evt.initEvent('daysAgoSearch', true, false);

chrome.omnibox.onInputEntered.addListener(function(text) {
    // parse the text and save to storage
    chrome.tabs.create({url: 'more.html'});
    text.dispatchEvent(evt);
});