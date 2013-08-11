var tasks = {
  data: []
},
  class_vals = {
    "1": {
      "1": "grid-item single",
    },
    "2": {
      "1": "grid-item single single-one-of-three",
      "2": "grid-item right-row right-row-second-of-three",
      "3": "grid-item right-row right-row-third-of-three",
    },
    "4": {
      "1": "grid-item single single-one-of-more",
      "2": "grid-item right-row right-row-second-of-more",
      "3": "grid-item right-row right-row-third-of-more",
      "4": "grid-item bottom-row bottom-row-one",
      "5": "grid-item bottom-row bottom-row-two",
      "6": "grid-item bottom-row bottom-row-three",
      "7": "grid-item bottom-row bottom-row-four",
      "8": "grid-item bottom-row bottom-row-five",
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
      "9": "hidden",
    },
  },
  start_colour = "#D9005B",
  start_pink = "#D9005B",
  start_blue = "#028E9B",
  start_green = "#76AF2C",
  start_yellow = "#FF6F00",
  parse_error = "",
  storage_date_format = "YYYY-MM-DD HH:mm:ss",
  home_screen = true,
  timeout_id = -1,
  timeout_period = 60000,
  command_regex = /^([\S\s]*)(\sin|on\s)([\S\s]*?)$/;

function constrain_value(val_to_constrain) {
  var x = val_to_constrain;

  if (x == 3) {
    x = 2
  } else if (x >= 4 && x <= 9) {
    x = 4;
  } else if (x > 9) {
    x = 9;
  }

  return x;
}

/** 
 * Gets the applicable classes for a grid item based on its index and the total number of items
 *
 * item_index is ONE based
 */
function get_grid_class(grid_item, num_items, item_index) {
  var x = constrain_value(num_items),
    y = Math.min(item_index, 9),
    base_class = "";

  try {
    base_class = class_vals[x + ""][y + ""];
  } catch (e) {
    base_class = "unknown";
  }

  return base_class;
}

/**
 * Gets a grid colour based on its due_date
 */
function get_grid_colour(grid_item, item_index) {
  var date_delta = grid_item.due_date.diff(moment(), 'hours', true),
    base_colour = "";

  if (date_delta < 0) {
    base_colour = start_pink;
  } else if (date_delta < 24) {
    base_colour = start_yellow;
  } else if (date_delta < 72) {
    base_colour = start_blue;
  } else {
    base_colour = start_green;
  }

  return ColorLuminance(base_colour, -0.03 * item_index);
}

/**
 * Draws a grid from a list of objects
 */
function draw_grid(data, element, draw_grid) {
  // load in initial test data
  var not_done = [],
    num_items = 0,
    current_colour = start_colour;

  // clear the timeout
  if (timeout_id != -1) {
    clearTimeout(timeout_id);
    timeout_id = -1;
  }
  
  // clear the element
  element.html("");

  // get the incomplete objects
  for (var i = 0; i < data.length; ++i) {
    if (!data[i].done) {
      not_done.push(data[i]);
    }
  }

  num_items = not_done.length;

  not_done = not_done.sort(

  function(a, b) {
    if (a.due_date.isSame(b.due_date)) {
      return 0;
    }
    if (a.due_date.isBefore(b.due_date)) {
      return -1;
    }
    return 1;
  });

  // now draw!
  for (var i = 0; i < num_items; ++i) {
    var elem = $("<div>"),
      classNames = "";

    if (draw_grid) {
      classNames = get_grid_class(not_done[i], num_items, i + 1);
    } else {
      classNames = get_grid_class(not_done[i], -1, i + 1);
    }

    // check if we are doing colours based on the time since updated
    if (start_colour == "#000000") {
      current_colour = get_grid_colour(not_done[i], i + 1);
    }

    // set up the styles
    elem.attr("class", classNames);
    elem.html(get_inner_grid_html(not_done[i]));
    elem.data('index', i);
    elem.css("backgroundColor", current_colour);

    // get the next colour
    current_colour = ColorLuminance(current_colour, -0.1);

    // append the new element
    element.append(elem);
  }

  // save the open tasks
  tasks.data = not_done;

  // set an update timeout
  timeout_id = setTimeout(function() {
    trigger_draw_grid();
  }, timeout_period);
}

/** 
 * Return HTML for displaying a task inside the main container
 */
function get_inner_grid_html(grid_obj) {
  var html = "<div class=\"grid-wrapper\"><div class=\"grid-inner\">";
  html += "<p class=\"grid-date\">" + grid_obj.due_date.fromNow() + "</p>";
  html += "<p class=\"grid-title\">" + grid_obj.title + "</p>";
  html += "</div></div>";
  return html;
}

/** 
 * parse a task string such as "write a book in 6 days" or "write a book on 2012-12-15"
 */
function parse_task(taskString) {
  console.log("Parsing: " + taskString);

    var taskName, taskDate, lastCommand, i, idx, tmp, timeCount,
        lastCommandIdx = -1,
        commands = [" on ", " in ", " at ", " by ", " tomorrow", " today"],
        daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
        unitsOfTime = [
            "SECOND", "SECONDS", "MINUTE", "MINUTES", "HOUR", "HOURS", "DAY", "DAYS",
            "WEEK", "WEEKS", "MONTH", "MONTHS", "YEAR", "YEARS"];

    // find out which command occurred last
    for (i = 0; i < commands.length; i += 1) {
        idx = taskString.lastIndexOf(commands[i]);

        // check if we found a later command
        if (idx > lastCommandIdx) {
            lastCommandIdx = idx;
            lastCommand = commands[i];
        }
    }

    // check if we found a command
    if (lastCommandIdx === -1) {
        parse_error = "Unable to find a command - have a look at the hints!";
        return null;
    }

    // trim the spaces from the command
    lastCommand = lastCommand.trim();

    // now parse the appropriate command
    if (lastCommand === "tomorrow" || lastCommand === "today") {
        taskName = taskString.replace("tomorrow", "").replace("today", "").trim();

        if (lastCommand === "tomorrow") {
            taskDate = moment().hour(17).minute(0).second(0).add('d', 1);
        } else {
            taskDate = moment().hour(23).minute(59).second(59);
        }
    } else if (lastCommand === "at" || lastCommand === "by") {
        taskName = taskString.substring(0, lastCommandIdx).trim();
        tmp = taskString.substring(lastCommandIdx).replace(lastCommand, "").trim().toUpperCase();

        // check for AM or PM
        if (tmp.indexOf("AM") !== -1) {
            timeCount = 0;
        } else if (tmp.indexOf("PM") !== -1) {
            timeCount = 12;
        } else {
            parse_error = "Task includes 'at' but was unable to find AM or PM";
            return null;
        }

        // find the hours number and set the date
        tmp = parseInt(tmp.replace("AM", "").replace("PM", "").trim(), 10);
        timeCount += tmp;
        taskDate = moment().hour(timeCount).minute(0).second(0);

        // if it is an "at" command then bubble if required
        if (lastCommand === "at" && taskDate.isBefore(moment())) {
            taskDate.add('d', 1);
        }

    } else if (lastCommand === "in" || lastCommand === "on") {
        taskName = taskString.substring(0, lastCommandIdx).trim();
        tmp = taskString.substring(lastCommandIdx).replace(lastCommand, "").trim().toUpperCase();
        taskDate = moment();

        if (lastCommand === "in") {
            tmp = tmp.split(" ");
            if (tmp.length !== 2) {
                parse_error = "Unable to parse 'in' command, expected it to end with '5 days' or similar, but found " + tmp.join(" ");
                return null;
            }

            // sort out the date
            timeCount = parseInt(tmp[0], 10);

            // check if we have a valid type of time
            if (unitsOfTime.indexOf(tmp[1]) === -1) {
                parse_error = "Unable to parse '" + tmp[1] + "', expected 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'";
                return null;
            }

            // convert weeks to days
            if (tmp[1] === "WEEKS" || tmp[1] === "WEEK") {
                timeCount *= 7;
                tmp[1] = "DAYS";
            }

            taskDate.add(tmp[1].toLowerCase(), timeCount);

        } else {
            // parse an "on" command
            timeCount = daysOfWeek.indexOf(tmp);

            // check if we have a valid type of time
            if (timeCount === -1) {
                parse_error = "Unable to parse '" + tmp + "', expected a day of the week (e.g. Monday)";
                return null;
            }

            // set task to 9am on the given day
            taskDate.hour(9);
            taskDate.minute(0);
            taskDate.second(0);
            taskDate.day(timeCount);

            // check if we need to bubble up a week
            if (taskDate.isBefore(moment())) {
                taskDate.add('d', 7);
            }
        }
    }

    // if we got this far we have populated name and date. Create a new task and return it
    console.log("Parsed task: '" + taskName + "' at " + taskDate.format(storage_date_format));

    // push the new task
    var task = {
        title: taskName,
        due_date: taskDate,
        done: false
    };

    tasks.data.push(task);
    save_tasks(tasks);

    // all done :)
    return true;
}

/**
 * Saves tasks to the database
 */
function save_tasks(tasks) {
  // transform the data
  var new_data = [];

  for (var i = 0; i < tasks.data.length; ++i) {
    if (!tasks.data[i].done) {
      var tmp_task = {
        title: tasks.data[i].title,
        due_date: tasks.data[i].due_date.format(storage_date_format),
        done: tasks.data[i].done
      };
      new_data.push(tmp_task);
    }
  }

  chrome.storage.sync.set({
    'daysago': new_data
  }, function() {
    trigger_draw_grid();
    console.log(chrome.runtime.lastError);
  });
}

/**
 * Loads tasks from local storage and draws the grid when done
 */
function load_tasks() {
  chrome.storage.sync.get('daysago', function(items) {
    tasks.data = [];
    if (items.hasOwnProperty("daysago")) {
      var loaded_data = items.daysago;

      for (var i = 0; i < loaded_data.length; ++i) {
        loaded_data[i].due_date = moment(loaded_data[i].due_date, storage_date_format);
        tasks.data.push(loaded_data[i]);
      }

    }
    trigger_draw_grid();
    if (tasks.data.length == 0) {
        $("p#welcome-message").delay(800).fadeIn('slow');
    }
  });
}

/**
 * Draws the grid, or a flat list if we are in the manage view 
 */
function trigger_draw_grid() {
  var elem = home_screen ? $("#main-container") : $("#list-container");

  // draw the grid
  draw_grid(tasks.data, elem, home_screen);
}

/**
 * Gets the swatch colour from storage and saves to start_colour
 */
function get_swatch_colour() {
  chrome.storage.sync.get('daysago_swatch', function(item) {
    start_colour = item.daysago_swatch;
    trigger_draw_grid()
  });
}

/**
 * Sets the swatch colour and saves it to database 
 */
function set_swatch_colour(new_colour) {
  chrome.storage.sync.set({
    'daysago_swatch': new_colour
  }, function() {
    start_colour = new_colour;
    trigger_draw_grid();
  });
}

/**
 * converts an rgb value to hex 
 */
function rgb2hex(rgb) {
  if (rgb.search("rgb") == -1) {
    return rgb;
  } else {
    rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);

    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
  }
}

/** 
 * found at http://www.sitepoint.com/javascript-generate-lighter-darker-color/
 */
function ColorLuminance(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;
  // convert to decimal and change luminosity
  var rgb = "#",
    c, i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }
  return rgb;
}

/** 
 * fire it up
 */
$(document).ready(function() {
  // hook up the enter key on the new item box
  $("#new_task").keydown(function(event) {
    $(this).removeClass("error");
    $("#input-errors").slideUp();

    if (event.which == 13) {
      event.preventDefault();
      if (parse_task($(this).val())) {
        $(this).val("");
      } else {
        $(this).addClass("error");
        $("#input-errors").html(parse_error);
        $("#input-errors").slideDown();
      }
    }
  });

  // hook up the swatch setting events
  $(".swatch").on('click', function(e) {
    e.preventDefault();

    var new_colour = rgb2hex($(this).css("backgroundColor"));
    set_swatch_colour(new_colour);
  });

  // handle clicking of "unknown" elements in the list view to cancel them
  $("#list-container").on('click', '.unknown', function(e) {
    e.preventDefault();
    var id = $(this).data('index');

    tasks.data[id].done = true;
    save_tasks(tasks);
  });

  $(".manage-button").on('click', function(e) {
    e.preventDefault();

    home_screen = false;
    $("#manage").fadeOut();
    $("#welcome-message").hide();
    $("#main-container").fadeOut('slow', function() {
      $("#form-container").slideDown();
      $("#list-container").slideDown();
      $("#view").fadeIn();
    });

    trigger_draw_grid();

  });

  $(".home-button").on('click', function(e) {
    e.preventDefault();

    home_screen = true;
    $("#form-container").slideUp('fast');
    $("#list-container").slideUp('fast');
    $("#view").fadeOut('slow', function() {
      $("#main-container").fadeIn('slow', function() {
        $("#welcome-message").show();
        $("#manage").fadeIn();
      });
    });

    trigger_draw_grid();
  });

  // get the swatch colour
  get_swatch_colour();

  // draw the grid
  load_tasks();
});

function parseQuery(text) {
  var elem = $("#form-container input");
  if (elem.length == 0) return;

  elem.val(text);
  elem.trigger(jQuery.Event('keydown', {
    which: 13
  }));
  elem.focus();
}