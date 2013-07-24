var test_objs = { 
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
    colour_classes = [" panic", " errr-hurry-up", " all-good-mate", " worry-about-it-later"];    
    
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
        base_class = "",
        colour_class = colour_classes[3],
        time_delta = 0;
        
    try 
    {
        base_class = class_vals[x + ""][y + ""];
    }
    catch (e)
    {
        base_class = "unknown";
    }

    // get the time difference
    time_delta = grid_item.due_date.diff(moment(), 'days');
    
    if (time_delta < 0) {
        colour_class = colour_classes[0];
    } else if (time_delta <= 2) {
        colour_class = colour_classes[1];
    } else if (time_delta <= 7) {
        colour_class = colour_classes[2];
    }
    
    // todo : get the correct grid colour
    return base_class + colour_class;
}
/**
 * Draws a grid from a list of objects
 */
function draw_grid(data, element, draw_grid) {
    // load in initial test data
    var not_done = [],
        num_items = 0;
    
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
        
        elem.setAttribute("class", classNames);
        elem.innerHTML = get_inner_grid_html(not_done[i]);
        element.appendChild(elem);
    }
}

/** 
 * Return HTML for displaying a task inside the main container
 */
function get_inner_grid_html(grid_obj) { 
    var html = "<div class=\"grid-wrapper\"><div class=\"grid-inner\">";
    html += "<p class=\"grid-date\">" + grid_obj.title + "</p>";
    html += "<p class=\"grid-title\">" + grid_obj.due_date.fromNow() + "</p>";
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
    
    // rebuild the task name inserting " in " where it has been removed
    for (var i = 0; i < parts.length; ++i) {
        task_name += parts[i];
        if (i < parts.length - 1) {
            task_name += " in ";
        }
    }
    
    // now parse the date
    task_date = task_date.add(date_parts[1], date_parts[0]);
    
    console.log(task_name);
    console.log(moment(task_date));
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
 * fire it up
 */
window.onload = function () {
    var elem = document.getElementById("main-container"),
        proper_classes = true;
    
    // handle the flat list in the manage page
    if (elem === undefined || elem === null) {
        elem = document.getElementById("list-container");
        proper_classes = false;
    }
    
    // draw the grid
    draw_grid(test_objs.data, elem, proper_classes);
}