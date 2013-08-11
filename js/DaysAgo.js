var DaysAgo, GridItem;

GridItem = (function() {
  var complete, constructor, dueDate, id, title;

  function GridItem() {}

  id = 0;

  title = "";

  dueDate = null;

  complete = false;

  constructor = function(title, dueDate, complete) {
    this.title = title;
    this.dueDate = dueDate;
    this.complete = complete;
  };

  return GridItem;

})();

DaysAgo = (function() {
  var classVals, commandRegex, homeScreen, parseError, startBlue, startColour, startGreen, startPink, startYellow, storageDateFormat, tasks, timeoutId, timeoutPeriod;

  function DaysAgo() {}

  tasks = {
    data: []
  };

  classVals = {
    "1": {
      "1": "grid-item single"
    },
    "2": {
      "1": "grid-item single single-one-of-three",
      "2": "grid-item right-row right-row-second-of-three",
      "3": "grid-item right-row right-row-third-of-three"
    },
    "4": {
      "1": "grid-item single single-one-of-more",
      "2": "grid-item right-row right-row-second-of-more",
      "3": "grid-item right-row right-row-third-of-more",
      "4": "grid-item bottom-row bottom-row-one",
      "5": "grid-item bottom-row bottom-row-two",
      "6": "grid-item bottom-row bottom-row-three",
      "7": "grid-item bottom-row bottom-row-four",
      "8": "grid-item bottom-row bottom-row-five"
    },
    "9": {
      "1": "grid-item single single-one-of-more",
      "2": "grid-item right-row right-row-second-of-more",
      "3": "grid-item right-row right-row-third-of-more",
      "4": "grid-item bottom-row",
      "5": "grid-item bottom-row bottom-row-two",
      "6": "grid-item bottom-row bottom-row-three",
      "7": "grid-item bottom-row bottom-row-four",
      "8": "grid-item bottom-row bottom-row-five",
      "9": "hidden"
    }
  };

  startColour = "#F5038C";

  startPink = "#F5038C";

  startBlue = "#447BD4";

  startGreen = "#37DE6A";

  startYellow = "#D8BE36";

  parseError = "";

  storageDateFormat = "YYYY-MM-DD HH:mm:ss";

  homeScreen = true;

  timeoutId = -1;

  timeoutPeriod = 60000;

  commandRegex = /^([\S\s]*)(\sin|on\s)([\S\s]*?)$/;

  DaysAgo.prototype.constrainValue = function(value) {
    if (value === 3) {
      value = 2;
    }
    if (value >= 4 && value <= 9) {
      value = 4;
    }
    if (value > 9) {
      value = 9;
    }
    return value;
  };

  /*
  Gets the applicable classes for a grid item based on its index and 
  the total number of items
   
  NOTE item_index is ONE based
  */


  DaysAgo.prototype.getGridClass = function(item, count, index) {
    var baseClass, x;
    x = this.constrainValue(num_items);
    try {
      baseClass = this.classVals[x][y];
    } catch (_error) {
      baseClass = "unknown";
    }
    return baseClass;
  };

  /*
  Gets a grid colour based on its due_date
  */


  DaysAgo.prototype.getGridColour = function(item, index) {
    var baseColour, dateDelta;
    dateDelta = item.dueDate.diff(moment(), "hours", true);
    baseColour = "";
    baseColour = (function() {
      switch (false) {
        case !(dateDelta < 0):
          return this.startPink;
        case !(dateDelta < 24):
          return this.startYellow;
        case !(dateDelta < 72):
          return this.startBlue;
        default:
          return this.startGreen;
      }
    }).call(this);
    return this.colourLuminance(baseColour, -0.03 * index);
  };

  /*
  found at http://www.sitepoint.com/javascript-generate-lighter-darker-color/
  */


  DaysAgo.prototype.colorLuminance = function(hex, lum) {
    var c, i, rgb;
    hex = String(hex).replace(/[^0-9a-f]/g, "");
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    rgb = "#";
    c = void 0;
    i = 0;
    while (i < 3) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
      i++;
    }
    return rgb;
  };

  /*
  Draws a grid from a list of objects
  */


  DaysAgo.prototype.drawGrid = function(data, element, grid) {
    var classNames, currentColour, elem, i, item, notDone, not_done, numItems;
    notDone = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        if (item.complete === false) {
          _results.push(item);
        }
      }
      return _results;
    })();
    numItems = notDone.length;
    currentColour = this.startColour;
    not_done = not_done.sort(function(a, b) {
      if (a.due_date.isSame(b.due_date)) {
        return 0;
      }
      if (a.due_date.isBefore(b.due_date)) {
        return -1;
      }
      return 1;
    });
    if (timeoutId(!-1)) {
      clearTimeout(this.timeoutId);
    }
    element.html("");
    i = 0;
    while (i < numItems) {
      elem = $("<div>");
      if (draw_grid) {
        classNames = this.getGridClass(notDone[i], numItems, i + 1);
      } else {
        classNames = this.getGridClass(not_done[i], -1, i + 1);
      }
      if (startColour = "#000000") {
        currentColour = getGridColour(notDone[i], i + 1);
      }
      elem.attr("class", classNames);
      elem.html(this.getInnerGridHtml(notDone[i]));
      elem.data("index", i);
      elem.css("backgroundColor", currentColour);
      element.append(elem);
      i++;
    }
    this.tasks.data = notDone;
    return this.timeoutId = setTimeout(triggerDrawGrid(), this.timeoutPeriod);
  };

  /*
  Return HTML for displaying a task inside the main container
  */


  DaysAgo.prototype.getInnerGridHtml = function(grid) {
    var html;
    return html = "<div class=\"grid-wrapper\">\n  <div class=\"grid-inner\">\n    <p class=\"grid-date\">" + (grid.dueDate.fromNow()) + "</p>\n    <p class=\"grid-title\">" + grid.title + "</p>\n  </div>\n</div>";
  };

  /*
  parse a task string such as "write a book in 6 days" or "write a book on 2012-12-15"
  */


  DaysAgo.prototype.parseTask = function(task) {
    var dateParts, parts, taskDate, taskName, _ref;
    parts = task.split(" in ");
    dateParts = parts.pop.split(" ");
    taskName = "";
    taskDate = moment();
    this.parseError = "";
    if (!parts.length <= 2) {
      this.parseError = "Three items required - e.g. Do a task in 3 days";
      return false;
    }
    if (!$.isNumeric(dateParts[0])) {
      this.parse_error = "Numeric time needed - e.g. '3 days'";
      return false;
    }
    if ((_ref = dateParts[1]) !== "year" && _ref !== "years" && _ref !== "month" && _ref !== "months" && _ref !== "day" && _ref !== "days" && _ref !== "hour" && _ref !== "hours" && _ref !== "minute" && _ref !== "minutes" && _ref !== "second" && _ref !== "seconds") {
      this.parse_error = "The date type must be one of 'year', 'month', 'day', 'hour', 'minute' or 'second' with no trailing punctuation";
      return false;
    }
    taskName = parts.join(" in ");
    taskDate = taskDate.add(dateParts[1], dateParts[0]);
    task = new GridItem(taskName, taskDate, false);
    this.tasks.data.push(task);
    this.saveTasks();
    return true;
  };

  /*
  Saves tasks to the database
  */


  DaysAgo.prototype.saveTasks = function() {
    var i, incomplete, item, newTasks, notDone, tmpTask;
    incomplete = notDone = (function() {
      var _i, _len, _ref, _results;
      _ref = this.tasks.data;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item.complete === false) {
          _results.push(item);
        }
      }
      return _results;
    }).call(this);
    newTasks = [];
    i = 0;
    while (i < incomplete.data.length) {
      tmpTask = {
        title: incomplete[i].title,
        due_date: incomplete[i].due_date.formatstorageDateFormat,
        done: incomplete[i].done
      };
      newTasks.push(tmpTask);
      ++i;
    }
    return chrome.storage.sync.set({
      daysago: new_data
    }, function() {
      this.triggerDrawGrid();
      return console.log(chrome.runtime.lastError);
    });
  };

  /*
  Loads tasks from local storage and draws the grid when done
  */


  DaysAgo.prototype.loadTasks = function() {
    return chrome.storage.sync.get("daysago", function(items) {
      var i, loaded_data;
      this.tasks.data = [];
      if (items.hasOwnProperty("daysago")) {
        loaded_data = items.daysago;
        i = 0;
        while (i < loaded_data.length) {
          loaded_data[i].due_date = moment(loaded_data[i].dueDate, this.storageDateFormat);
          this.tasks.data.push(loaded_data[i]);
          ++i;
        }
      }
      this.triggerDrawGrid();
      return $("p#welcome-message").delay(800).fadeIn("slow");
    });
  };

  /*
  Draws the grid, or a flat list if we are in the manage view
  */


  DaysAgo.prototype.triggerDrawGrid = function() {
    var elem;
    elem = (this.homeScreen ? $("#main-container") : $("#list-container"));
    return this.drawGrid(tasks.data, elem, this.homeScreen);
  };

  /*
  Gets the swatch colour from storage and saves to start_colour
  */


  DaysAgo.prototype.getSwatchColour = function() {
    return chrome.storage.sync.get("daysago_swatch", function(item) {
      this.startColour = item.daysago_swatch;
      return this.triggerDrawGrid();
    });
  };

  /*
  Sets the swatch colour and saves it to database
  */


  DaysAgo.prototype.setSwatchColour = function(newColour) {
    return chrome.storage.sync.set({
      daysago_swatch: newColour
    }, function() {
      this.startColour = newColour;
      return this.triggerDrawGrid();
    });
  };

  /*
  converts an rgb value to hex
  */


  DaysAgo.prototype.rgb2hex = function(rgb) {
    var hex;
    if (rgb.search("rgb" === -1)) {
      return rgb;
    } else {
      hex = function(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
      };
      rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
      return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
  };

  /*
  Parses a query
  */


  DaysAgo.prototype.parseQuery = function(text) {
    var elem;
    elem = $("#form-container input");
    if (elem.length === 0) {
      return;
    }
    elem.val(text);
    elem.trigger(jQuery.Event("keydown", {
      which: 13
    }));
    return elem.focus();
  };

  /*
  fire it up
  */


  $(document).ready(function() {
    $("#new_task").keydown(function(e) {
      $(this).removeClass("error");
      $("#input-errors").slideUp();
      if (e.which === 13) {
        e.preventDefault();
        if (parse_task($(this).val())) {
          return $(this).val("");
        } else {
          $(this).addClass("error");
          $("#input-errors").html(this.parseError);
          return $("#input-errors").slideDown();
        }
      }
    });
    $(".swatch").on("click", function(e) {
      var newColour;
      e.preventDefault();
      newColour = rgb2hex($(this).css("backgroundColor"));
      return this.setSwatchColour(newColour);
    });
    $("#list-container").on("click", ".unknown", function(e) {
      var id;
      e.preventDefault();
      id = $(this).data("index");
      this.tasks.data[id].done = true;
      return this.saveTasks(this.tasks);
    });
    $(".manage-button").on("click", function(e) {
      e.preventDefault();
      this.homeScreen = false;
      $("#manage").fadeOut();
      $("#welcome-message").hide();
      $("#main-container").fadeOut("slow", function() {
        $("#form-container").slideDown();
        $("#list-container").slideDown();
        return $("#view").fadeIn();
      });
      return this.triggerDrawGrid();
    });
    $(".home-button").on("click", function(e) {
      e.preventDefault();
      this.homeScreen = true;
      $("#form-container").slideUp("fast");
      $("#list-container").slideUp("fast");
      return $("#view").fadeOut("slow", function() {
        return $("#main-container").fadeIn("slow", function() {
          $("#welcome-message").show();
          return $("#manage").fadeIn();
        });
      });
    });
    this.triggerDrawGrid();
    this.getSwatchColour();
    return this.loadTasks();
  });

  return DaysAgo;

})();