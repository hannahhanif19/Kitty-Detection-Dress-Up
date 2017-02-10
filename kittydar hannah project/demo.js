// Title: Kitty Detection Dress Up!
// Designed by: Hannah Hanif
// Date: 2/10/17

// Description: 
// This is a image filter that detects cat images and draws a bow and hat image on the cat as best as possible.
// This can randomize the hats and bows on the cat. However, it cheers you up to see the hat and bow on a cat either placed perfectly or a little off!

//Sources:
//Modified from the KittyDar code
//Link: https://github.com/harthur/kittydar

//Try it for yourself. It is a lot of fun!!

var canvas2;
var bow, bows, bow1, bow2, bow3, bow4;
var hat, hats, hat1, hat2, hat3, hat4;

function windowResized() {
  console.log("resized");
  resizeCanvas(windowWidth, windowHeight);
}

function preload() {
  bow1 = loadImage("imagess/BowTIE.png");
  bow2 = loadImage("imagess/BowTIE1.png");
  bow3 = loadImage("imagess/BowTIE2.png");
  bow4 = loadImage("imagess/BowTIE3.png");
  hat1 = loadImage("imagess/hat1.png");
  hat2 = loadImage("imagess/hat2.png");
  hat3 = loadImage("imagess/hat3.png");
  hat4 = loadImage("imagess/hat4.png");
}

function setup() {
  canvas2 = createCanvas(windowWidth, windowHeight); //this is to create a new canvas besides the main one
  canvas2.position(0, 0);
  canvas2.style('z-index', '-1'); //this is to have the background behind the picture dragover canvas
  background(random(255), random(255), random(255)); //random colored background
}

function draw() {

}

$(document).ready(function() { //this is the function on how the picture url is found and shown on the dragover canvas
  $("#example-chooser").hide();

  $("#select-button").click(function(event) {
    $("#example-chooser").toggle();
    $("#example-chooser").css({
      left: event.pageX + 50,
      top: event.pageY - 50
    });
  });

  var viewer = $("#viewer");

  viewer.on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();

    viewer.addClass('dragover');
    return false;
  })

  viewer.on('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();

    viewer.removeClass('dragover');
    return false;
  });

  viewer.on('drop', function(e) {
    // prevent browser from opening file
    e.stopPropagation();
    e.preventDefault();
    viewer.removeClass('dragover');

    var dataTransfer = e.originalEvent.dataTransfer;

    var src = dataTransfer.getData("x-kittydar/url");
    if (src) {
      detectFromUrl(src);
      $("#example-chooser").hide();
    }

    var files = e.originalEvent.dataTransfer.files;
    if (files.length) {
      detectFromFiles(files);
    }

    return false;
  });

  var examples = $('.example-thumb')

  examples.click(function(event) {
    // reload to get full size image
    detectFromUrl(event.target.src);
    $("#example-chooser").hide();
  })

  examples.on('dragstart', function(e) {
    e.originalEvent.dataTransfer.setData('x-kittydar/url', this.src);
  });
});

function detectFromUrl(src) { //this is the function for when a new picture is dragged over
  var img = new Image();
  img.onload = function() {
    detectImage(img);
  }
  img.src = src;
}

function detectImage(img) { //function to detect the image given, which is part of the detectFromUrl function
  drawToCanvas(img);
  detector.abortCurrent();
  detector.detectCats();
}

function detectFromFiles(files) { //function to only allow image files and nothing else, and to load it
  var file = files[0];
  var imageType = /image.*/;

  if (!file.type.match(imageType)) {
    return;
  }

  var img = new Image();

  var reader = new FileReader();
  reader.onload = function(e) {
    img.onload = function() {
      detectImage(img);
    }
    $("#progress").text("loading image...");
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function drawToCanvas(img) { //this is the function for the canvas that takes the picture to change size according to the image

  var width = img.width;
  var height = img.height;

  var max = Math.max(width, height)
  var scale = Math.min(max, 420) / max;

  width *= scale;
  height *= scale;

  $("#viewer-container").width(width).height(height);
  $("#viewer").width(width).height(height);

  var anno = $("#annotations").get(0);
  anno.width = width
  anno.height = height;

  var canvas = $("#preview").get(0);
  canvas.width = width;
  canvas.height = height;

  // draw image to preview canvas
  var context = canvas.getContext("2d");
  context.drawImage(img, 0, 0, img.width, img.height,
    0, 0, width, height);
}

var detector = { //this is the overall variable that consists of functions within it to detect the cat and what to doonce found
  abortCurrent: function() {
    if (this.worker) {
      this.worker.terminate();
    }
  },

  detectCats: function() { //when detecting cats function
    $("#progress").text("detecting cats...");

    var canvas = $("#preview").get(0);

    if (window.Worker) {
      var worker = new Worker("detection-worker.js");
      worker.onmessage = this.onMessage;
      worker.onerror = this.onError;

      var resizes = kittydar.getAllSizes(canvas);
      worker.postMessage(resizes);

      this.worker = worker;
    } else {
      var rects = kittydar.detectCats(canvas);
      this.paintCats(rects);
    }
  },

  paintCats: function(rects) { //function to put rectangle around the cat's face when detecting and detected
    var noun = rects.length == 1 ? "cat" : "cats";
    $("#progress").text(rects.length + " " + noun + " detected");

    this.clearRects();
    this.paintRects(rects, "blue");

    var bows = ["BowTIE.png", "BowTIE1.png", "BowTIE2.png", "BowTIE3.png"];
    var randomNum = Math.floor(Math.random() * bows.length);
    var bow = new Image(); //this function adds the bow proportionally to the cat when the cat is detected and randomly add a bow to the cat
    bow.onload = function() {
      var canvas = $("#preview").get(0);
      var context = canvas.getContext("2d");
      for (var i = 0; i < rects.length; i++) {
        var rect = rects[i];
        context.drawImage(bow, (rects[i].x) - 10, (rects[i].y) + 100, rects[i].width, (rects[i].height) / 2);
      }
    }
    bow.src = "imagess/" + bows[randomNum];

    var hats = ["hat.png", "hat2.png", "hat3.png", "hat4.png"];
    var randomNum1 = Math.floor(Math.random() * hats.length);
    var hat = new Image(); //this function adds the hat proportionally to the cat when the cat is detected and randomly add a hat to the cat
    hat.onload = function() {
      var canvas = $("#preview").get(0);
      var context = canvas.getContext("2d");
      for (var i = 0; i < rects.length; i++) {
        var rect = rects[i];
        context.drawImage(hat, (rects[i].x) - 10, (rects[i].y) - 20, rects[i].width, (rects[i].height) / 2);
      }
    }
    hat.src = "imagess/" + hats[randomNum1];
  },

  clearRects: function() { //function to remove rectangles
    var canvas = $("#annotations").get(0);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },

  paintRects: function(rects, color) { //function for the rectangles around the detected cat's face(s)
    var canvas = $("#annotations").get(0);
    var ctx = canvas.getContext("2d");

    ctx.lineWidth = 2;
    ctx.strokeStyle = color || "blue";

    for (var i = 0; i < rects.length; i++) {
      var rect = rects[i];
      ctx.strokeRect(rects[i].x, rects[i].y, rects[i].width, rects[i].height);
    }
  },

  onMessage: function(event) { //function on what to do when cat detected or not - connects many of the previous functions together
    var data = event.data;
    if (data.type == 'progress') {
      detector.showProgress(data);
    } else if (data.type == 'result') {
      detector.paintCats(data.cats);
      detector.clearRects();
    }
  },

  onError: function(event) {
    console.log("Error from detection Worker:", event.message)
  },

  showProgress: function(progress) {
    console.log(progress);
    this.paintRects(progress.rects, "turquoise");
    $("#progress").text("detecting at " + progress.size + "px...");
  }
}