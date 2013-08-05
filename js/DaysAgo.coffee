class GridItem
  id = 0
  title = ""
  dueDate = null
  complete = false
  
  constructor (@title, @dueDate, @complete) ->

class DaysAgo
  tasks = 
    data: []

  classVals = 
    "1": 
      "1": "grid-item single"
    "2":
        "1": "grid-item single single-one-of-three"
        "2": "grid-item right-row right-row-second-of-three"
        "3": "grid-item right-row right-row-third-of-three"
    "4":
        "1": "grid-item single single-one-of-more"
        "2": "grid-item right-row right-row-second-of-more"
        "3": "grid-item right-row right-row-third-of-more"
        "4": "grid-item bottom-row bottom-row-one"
        "5": "grid-item bottom-row bottom-row-two"
        "6": "grid-item bottom-row bottom-row-three"
        "7": "grid-item bottom-row bottom-row-four"
        "8": "grid-item bottom-row bottom-row-five"
    "9":
        "1": "grid-item single single-one-of-more"
        "2": "grid-item right-row right-row-second-of-more"
        "3": "grid-item right-row right-row-third-of-more"
        "4": "grid-item bottom-row"
        "5": "grid-item bottom-row bottom-row-two"
        "6": "grid-item bottom-row bottom-row-three"
        "7": "grid-item bottom-row bottom-row-four"
        "8": "grid-item bottom-row bottom-row-five"
        "9": "hidden"
  
  startColour = "#F5038C"
  startPink = "#F5038C"
  startBlue = "#447BD4"
  startGreen = "#37DE6A"
  startYellow = "#D8BE36"
  parseError = ""
  storageDateFormat = "YYYY-MM-DD HH:mm:ss"
  homeScreen = true
  timeoutId = -1
  timeoutPeriod = 60000
  commandRegex = /^([\S\s]*)(\sin|on\s)([\S\s]*?)$/
  
  constrainValue: (value) ->
    value = 2 if value == 3
    value = 4 if value >= 4 && value <= 9
    value = 9 if value > 9
    value

  ###
  Gets the applicable classes for a grid item based on its index and 
  the total number of items
 
  NOTE item_index is ONE based
  ###
  getGridClass(item, count, index) ->
    x = @constrainValue(num_items)

    try
      baseClass = @classVals[x][y]
    catch
      baseClass = "unknown"
      
    baseClass

  ###
  Gets a grid colour based on its due_date
  ###
  getGridColour(item, index) ->
    dateDelta = item.dueDate.diff(moment(), "hours", true)
    baseColour = ""
    
    baseColour = switch
      when dateDelta < 0 then @startPink
      when dateDelta < 24 then @startYellow
      when dateDelta < 72 then @startBlue
      else @startGreen
      
    @colourLuminance(baseColour, -0.03 * index)
    
  ###
  found at http://www.sitepoint.com/javascript-generate-lighter-darker-color/
  ###
  colorLuminance = (hex, lum) ->
  
    hex = String(hex).replace(/[^0-9a-f]/g, "")
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]  if hex.length < 6
    lum = lum or 0
  
    # convert to decimal and change luminosity
    rgb = "#"
    c = undefined
    i = 0
    while i < 3
      c = parseInt(hex.substr(i * 2, 2), 16)
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
      rgb += ("00" + c).substr(c.length)
      i++
    rgb
    
  ###
  Draws a grid from a list of objects
  ###
  drawGrid(data, element, grid) ->
    notDone = (item for item in data when item.complete is false)
    numItems = notDone.length
    currentColour = @startColour
    
    # sort the notDone items
    not_done = not_done.sort((a, b) ->
      return 0  if a.due_date.isSame(b.due_date)
      return -1  if a.due_date.isBefore(b.due_date)
      1
    )
    
    clearTimeout(@timeoutId) if timeoutId not -1
    
    element.html ""
    
    i = 0 
    while i < numItems
      elem = $("<div>")
      if draw_grid
        classNames = @getGridClass notDone[i], numItems, i + 1
      else
        classNames = @getGridClass not_done[i], -1, i + 1
      
      currentColour = getGridColour(notDone[i], i + 1) if startColour = "#000000" 
      
      # set up the styles
      elem.attr "class", classNames
      elem.html @getInnerGridHtml(notDone[i])
      elem.data "index", i
      elem.css "backgroundColor", currentColour
      element.append elem
      
      i++
    
    # save open tasks    
    @tasks.data = notDone
    
    # set an update timeout
    @timeoutId = setTimeout triggerDrawGrid(), @timeoutPeriod
  
  ###
  Return HTML for displaying a task inside the main container
  ###
  getInnerGridHtml(grid) ->
    html = """
    <div class="grid-wrapper">
      <div class="grid-inner">
        <p class="grid-date">#{grid.dueDate.fromNow()}</p>
        <p class="grid-title">#{grid.title}</p>
      </div>
    </div>
    """
    
  ###
  parse a task string such as "write a book in 6 days" or "write a book on 2012-12-15"
  ###
  parseTask(task) ->
    parts = task.split " in "
    dateParts = parts.pop.split " "
    taskName = ""
    taskDate = moment()
    
    @parseError = ""
    
    if not parts.length <= 2
      @parseError = "Three items required - e.g. Do a task in 3 days"
      return false
      
    if not $.isNumeric dateParts[0]
      @parse_error = "Numeric time needed - e.g. '3 days'";
      return false;
      
    # check we have a correctly formatted delta string
    if dateParts[1] not in ["year", "years", "month", "months", "day", "days", "hour", "hours", "minute", "minutes", "second", "seconds"]
      @parse_error = "The date type must be one of 'year', 'month', 'day', 'hour', 'minute' or 'second' with no trailing punctuation"
      return false
    
    taskName = parts.join " in "
    taskDate = taskDate.add dateParts[1], dateParts[0]
    
    # create and save the task
    task = new GridItem taskName, taskDate, false
    @tasks.data.push task
    @saveTasks
    
    true
  
  ###
  Saves tasks to the database
  ###
  saveTasks ->
    incomplete = notDone = (item for item in @tasks.data when item.complete is false)
    newTasks = []
    i = 0

    while i < incomplete.data.lengt
      tmpTask =
        title: incomplete[i].title
        due_date: incomplete[i].due_date.formatstorageDateFormat
        done: incomplete[i].done

      newTasks.push tmpTask
      ++i
      
    chrome.storage.sync.set
      daysago: new_data
    , ->
      trigger_draw_grid()
      console.log chrome.runtime.lastError
      
  ###
  Loads tasks from local storage and draws the grid when done
  ###
  loadTasks -> 
  chrome.storage.sync.get "daysago", (items) ->
    tasks.data = []
    if items.hasOwnProperty "daysago"
      loaded_data = items.daysago
      
      i = 0
      while i < loaded_data.length
        loaded_data[i].due_date = moment(loaded_data[i].due_date, storage_date_format)
        tasks.data.push loaded_data[i]
        ++i

    triggerDrawGrid()
    $("p#welcome-message").delay(800).fadeIn "slow"
    
  ###
  Draws the grid, or a flat list if we are in the manage view 
  ###
  triggerDrawGrid -> 
    elem = (if home_screen then $("#main-container") else $("#list-container"))
    draw_grid tasks.data, elem, home_screen
  
  ###
  Gets the swatch colour from storage and saves to start_colour
  ###
  getSwatchColour ->
    chrome.storage.sync.get "daysago_swatch", (item) ->
      @startColour = item.daysago_swatch
      triggerDrawGrid()

  ###
  Sets the swatch colour and saves it to database 
  ###
  setSwatchColour(newColour) -> 
    chrome.storage.sync.set
      daysago_swatch: newColour
    , ->
      @startColour = newColour
      triggerDrawGrid()
 
  ###
  converts an rgb value to hex
  ###
  rgb2hex = (rgb) ->
    if rgb.search "rgb" is -1
      rgb
    else
      hex = (x) ->
        ("0" + parseInt(x).toString(16)).slice -2
      rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/)
      "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])
     
  ###
  Parses a query
  ###
  parseQuery = (text) ->
    elem = $("#form-container input")
    return if elem.length is 0
    
    elem.val text
    elem.trigger jQuery.Event("keydown",
      which: 13
    )
    elem.focus()
   
  ###
  fire it up
  ###
  $(document).ready ->
  
    # hook up the enter key on the new item box
    $("#new_task").keydown (event) ->
      $(this).removeClass "error"
      $("#input-errors").slideUp()
      if event.which is 13
        event.preventDefault()
        if parse_task($(this).val())
          $(this).val ""
        else
          $(this).addClass "error"
          $("#input-errors").html @parseError
          $("#input-errors").slideDown()

    # hook up the swatch setting events
    $(".swatch").on "click", (e) ->
      e.preventDefault()
      newColour = rgb2hex($(this).css("backgroundColor"))
      setSwatchColour newColour
  
    # handle clicking of "unknown" elements in the list view to cancel them
    $("#list-container").on "click", ".unknown", (e) ->
      e.preventDefault()
      id = $(this).data("index")
      tasks.data[id].done = true
      saveTasks @tasks

    $(".manage-button").on "click", (e) ->
      e.preventDefault()
      @homeScreen = false
      $("#manage").fadeOut()
      $("#welcome-message").hide()
      $("#main-container").fadeOut "slow", ->
        $("#form-container").slideDown()
        $("#list-container").slideDown()
        $("#view").fadeIn()

      triggerDrawGrid()

    $(".home-button").on "click", (e) ->
      e.preventDefault()
      @homeScreen = true
      $("#form-container").slideUp "fast"
      $("#list-container").slideUp "fast"
      $("#view").fadeOut "slow", ->
        $("#main-container").fadeIn "slow", ->
          $("#welcome-message").show()
          $("#manage").fadeIn()

    triggerDrawGrid()

    # get the swatch colour
    getSwatchColour()
  
    # draw the grid
    loadTasks()
