var app_window = null;

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    bounds: {
      width: 1280,
      height: 1024,
      left: 100,
      top: 100
    },
    minWidth: 800,
    minHeight: 600
  }, function (created_window) {
    app_window = created_window;
  });
});
