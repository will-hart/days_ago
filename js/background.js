chrome.omnibox.onInputEntered.addListener(function(text) {

    // open the extension tab and parse the given string   
    chrome.tabs.create({url: 'more.html'}, function(tab) {
        var requested_id = tab.id,
            forceQueryParse = function(tab_id, info) {
                if (info.status == "complete" && tab_id == requested_id) 
                {
                    var views = chrome.extension.getViews();
                    var url = chrome.extension.getURL("more.html");
                    
                    chrome.tabs.onUpdated.removeListener(forceQueryParse);
                    for (var i = 0; i < views.length; i++) {
                        var view = views[i];
                        console.log(view.location.href);
                        //console.log(url);
                        //console.log(url == view.location.href);
                        if (view.location.href == url) {
                            view.parseQuery(text);
                        }
                    }
                }
            };
        
        chrome.tabs.onUpdated.addListener(forceQueryParse);
    });
});