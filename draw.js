var tasks = {
                data: [
                    { title: "A test #1", due_date: moment("2013-08-01", "YYYY-MM-DD"), done: false },  
                    { title: "A test #2", due_date: moment("2013-08-15", "YYYY-MM-DD"), done: false }, 
                    { title: "A test #4", due_date: moment("2013-07-06", "YYYY-MM-DD"), done: true }, 
                    { title: "A test #5", due_date: moment("2013-12-07", "YYYY-MM-DD"), done: false }, 
                    { title: "A test #6", due_date: moment("2013-07-05", "YYYY-MM-DD"), done: true }, 
                    { title: "A test #6", due_date: moment("2014-07-04", "YYYY-MM-DD"), done: false }, 
                    { title: "A test #6", due_date: moment("2013-07-03", "YYYY-MM-DD"), done: false }, 
                    { title: "A test #6", due_date: moment("2013-09-02", "YYYY-MM-DD"), done: false }, 
                    { title: "A test #6", due_date: moment("2014-07-01", "YYYY-MM-DD"), done: false }
                ]
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
    start_colour = "#F5038C",
    parse_error = "";
    
function constrain_value(val_to_constrain)
{
    var x = val_to_constrain;
    
    if (x == 3) 
    {
        x = 2
    }
    else if (x >= 4 && x <= 9) 
    {
        x = 4;
    }
    else if (x > 9) 
    {
        x = 9;
    }
    
    return x;
}

/** 
 * Gets the applicable classes for a grid item based on its index and the total number of items
 *
 * item_index is ONE based
 */
function get_grid_class(grid_item, num_items, item_index)
{
    var x = constrain_value(num_items),
        y = Math.min(item_index, 9),
        base_class = "";
        
    try 
    {
        base_class = class_vals[x + ""][y + ""];
    }
    catch (e)
    {
        base_class = "unknown";
    }
    
    return base_class;
}
/**
 * Draws a grid from a list of objects
 */
function draw_grid(data, element, draw_grid) {
    // load in initial test data
    var not_done = [],
        num_items = 0,
        current_colour = start_colour;
    
    // clear the element
    element.innerHTML = "";
    
    // get the incomplete objects
    for (var i = 0; i < data.length; ++i) 
    {
        if (!data[i].done) 
        {
            not_done.push(data[i]);
        }
    }
    
    num_items = not_done.length;
    
    not_done.sort(
        function(a,b) {
            return a.due_date > b.due_date;
        }
    );
    
    // now draw!
    for (var i = 0; i < num_items; ++i) 
    {
        var elem = document.createElement("div");
        var classNames = null;
        
        if (draw_grid) {
            classNames = get_grid_class(not_done[i], num_items, i + 1);
        } else {
            classNames = get_grid_class(not_done[i], -1, i+1);
        }
        
        
        // set up the styles
        elem.setAttribute("class", classNames);
        elem.innerHTML = get_inner_grid_html(not_done[i]);
        elem.style.backgroundColor = current_colour; 
        
        // get the next colour
        current_colour = ColorLuminance(current_colour, -0.08);
        
        // append the new element
        element.appendChild(elem);
    }
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
function parse_task(task_string) {
    var parts = task_string.split(" in "),
        date_parts = parts.pop().split(" "),
        task_name = "",
        task_date = moment();
        
    parse_error = "";
    
    // check for enough arguments
    if (! parts.length >= 2) {
        parse_error = "Three items required - e.g. Do a task in 3 days";
        return false;
    }
    
    // check the first date part is a number
    if (! $.isNumeric(date_parts[0])) {
        parse_error = "Numeric time needed - e.g. '3 days'";
        return false;
    }
    
    // check we have a correctly formatted delta string
    if (date_parts[1] != "years" && date_parts[1] != "year"
        && date_parts[1] != "months" && date_parts[1] != "month"
        && date_parts[1] != "days" && date_parts[1] != "day"
        && date_parts[1] != "hours" && date_parts[1] != "hour"
        && date_parts[1] != "minutes" && date_parts[1] != "minute"
        && date_parts[1] != "seconds" && date_parts[1] != "second") 
    {
        parse_error = "The date type must be one of 'year', 'month', 'day', 'hour', 'minute' or 'second'";
        return false;
    }
    
    
    // rebuild the task name inserting " in " where it has been removed
    for (var i = 0; i < parts.length; ++i) {
        task_name += parts[i];
        if (i < parts.length - 1) {
            task_name += " in ";
        }
    }
    
    // now parse the date
    task_date = task_date.add(date_parts[1], date_parts[0]);
    
    // push the new task
    var task = {
        title: task_name,
        due_date: task_date,
        done: false
    };
    
    tasks.data.push(task);
    save_tasks(tasks);    
    
    // all done :)
    return true;
}

/** 
 * found at http://www.sitepoint.com/javascript-generate-lighter-darker-color/
 */
function ColorLuminance(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
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
                due_date: tasks.data[i].due_date.format("YYYY-MM-DD hh:mm:SS"),
                done: tasks.data[i].done
            };
            new_data.push(tmp_task);
        }
    }

    chrome.storage.sync.set({'daysago': new_data}, function() {
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
                loaded_data[i].due_date = moment(loaded_data[i].due_date, "YYYY-MM-DD hh:mm:SS");
                tasks.data.push(loaded_data[i]);
            }
            
        }
        trigger_draw_grid();
    });
}

/**
 * Draws the grid, or a flat list if we are in the manage view 
 */
function trigger_draw_grid() {
    var elem = document.getElementById("main-container"),
        proper_classes = true;
    
    // handle the flat list in the manage page
    if (elem === undefined || elem === null) {
        elem = document.getElementById("list-container");
        proper_classes = false;
    }
    
    // draw the grid
    draw_grid(tasks.data, elem, proper_classes);
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
    chrome.storage.sync.set({'daysago_swatch': new_colour}, function() {
        start_colour = new_colour;
        trigger_draw_grid();
    });
}

/**
 * converts an rgb value to hex 
 */
function rgb2hex(rgb) {
     if (  rgb.search("rgb") == -1 ) {
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
 * fire it up
 */
$(document).ready( function() {
    // hook up the enter key on the new item box
    $("#new_task").keydown(function (event) {
        $(this).removeClass("error");
        
        if (event.which == 13) {
            event.preventDefault();
            if (parse_task($(this).val()))
            {
                $(this).val("");
            } else {
                $(this).addClass("error");
            }
        }
    });
    
    // hook up the swatch setting events
    $(".swatch").on('click', function(e) {
        e.preventDefault();
        
        var new_colour = rgb2hex($(this).css("backgroundColor"));
        set_swatch_colour(new_colour);
    });
    
    // get the swatch colour
    get_swatch_colour();
   
    // draw the grid
    load_tasks();
});

