var curr_slide_idx = 0;
var rect_in_progress = {x1:0,y1:0,x2:0,y2:0};
var rects = [];
var freq_bars = [];

var ns = 'http://www.w3.org/2000/svg';
var curr_user = "" + Math.floor((Math.random()*999998)+1);
var refresh_id = null;
var click2 = false;
var mre = null;

function calc_freq(){
	var freq_height = 10;
	
	var div = document.getElementById("drawing");
	var lines = Math.floor(div.getBoundingClientRect().height / freq_height);
	var freqs = Array(lines);
	for(var j = 0; j < freqs.length; j++){
		freqs[j] = 0;
	}
	for(var i = 0; i < rects.length; i++){
		var rect = rects[i];
		var j;
		var y1 = Math.floor(rect.y.baseVal.value);
		var y2 = Math.floor(y1 + rect.height.baseVal.value);
		for(j = y1; j < y2; j += freq_height){
			freqs[Math.floor(j/10)] += 1;
		}
		if(Math.floor((j - 10)/10) != Math.floor(y2/10)){
			freqs[Math.floor(y2/10)] += 1;
		}
	}
	console.log("Freqs: ");
	console.log(freqs);
	var svg = document.getElementById('drawing-svg');
	//var xr = div.getBoundingClientRect().width + div.getBoundingClientRect().x;
	for(var j = 0; j < lines; j++){
		var rect = document.createElementNS(ns, 'rect');
		var svgrect = svg.getBoundingClientRect();
		rect.setAttributeNS(null, 'width', (10*freqs[j]));
		rect.setAttributeNS(null, 'height', (freq_height));
		rect.setAttributeNS(null, 'x', svgrect.width - (10*freqs[j]));
		rect.setAttributeNS(null, 'y', (j*freq_height));
		rect.setAttributeNS(null, 'fill', '#00FF00');
		rect.setAttributeNS(null, 'opacity', '1');
		rect.setAttributeNS(null, 'style', 'z-index:20;position:absolute');
		svg.appendChild(rect);
		freq_bars.push(rect);
	}
}

function next_slide(evt){
	console.log("Next!");
	var curr_slide = document.getElementById("slide_"+curr_slide_idx);
	var next_slide = document.getElementById("slide_"+(curr_slide_idx+1));
	var slideno = document.getElementById("slideno");
	if(next_slide != null){	
		curr_slide.style.display = "none";
		next_slide.style.display = "initial";
		curr_slide_idx++;
		slideno.value = curr_slide_idx;
		clear_rects();
		get_rects();
	}
	else {
		console.log("No Next!");
	}
}

function prev_slide(evt){
	console.log("Previous!");
	var curr_slide = document.getElementById("slide_"+curr_slide_idx);
	var next_slide = document.getElementById("slide_"+(curr_slide_idx-1));
	var slideno = document.getElementById("slideno");
	if(next_slide != null){
		curr_slide.style.display = "none";
		next_slide.style.display = "initial";
		curr_slide_idx--;
		slideno.value = curr_slide_idx;
		clear_rects();
		get_rects();
	}
	else {
		console.log("No Previous!");
	}
}

function set_slide(evt){
	console.log("Set slide!");
	var slideno = document.getElementById("slideno");
	if(slideno.value == curr_slide_idx){
		console.log("Slide stays at " + curr_slide_idx);
	}
	else{
		var new_slide = document.getElementById("slide_"+slideno.value);
		var curr_slide = document.getElementById("slide_"+curr_slide_idx);
		if(new_slide != null){
			curr_slide.style.display = "none";
			new_slide.style.display = "initial";
			curr_slide_idx = Number(slideno.value);
			clear_rects();
			get_rects();
		}
		else{
			window.alert("Slide " + slideno.value + " doesn't exist");
		}
	}
}


function set_user(evt){
	console.log("user change");
	var user = document.getElementById("user");
	if(user.value == curr_user){
		console.log("user stays at " + curr_user);
	}
	else if(user.value == "0"){
		refresh_id = setInterval(function() {clear_rects(); get_rects()}, 5000);
	}
	else if(curr_user == "0"){
		clearInterval(refresh_id);	
	}
	curr_user = user.value;
	clear_rects();
	get_rects();

}


function clear_rects(){
	var svg = document.getElementById('drawing-svg');
	for(var i = 0; i < rects.length; i++){
		svg.removeChild(rects[i]);
	}
	rects = [];
	freq_bars = [];
}

function erase_rects(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			if(this.responseText == "Failure"){
				console.log("erase_rects: Error in parameters or file doesn't exist");
			}
			else{
				console.log("erase_rects: Success");
				clear_rects();
			}
		}
	}
	var url = "erase_rects.php/?user="+curr_user+"&slide="+curr_slide_idx;
	xhttp.open("GET", url, true);
	xhttp.send();
}

function get_rects(){
	var svg = document.getElementById('drawing-svg');
	var xhttp = new XMLHttpRequest();
	var slideimg = document.getElementById('img_'+curr_slide_idx);
	var rect = slideimg.getBoundingClientRect();
    var imgLeft,imgTop; //x and y
    var scrollTop = document.documentElement.scrollTop?
    document.documentElement.scrollTop:document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft?                   
    document.documentElement.scrollLeft:document.body.scrollLeft;
    imgTop = rect.top+scrollTop;
    imgLeft = rect.left+scrollLeft;
    xhttp.onreadystatechange = function() {
    	if(this.readyState == 4 && this.status == 200){
    		if(this.responseText == "Failure"){
    			console.log("get_rects: Error in parameters or file doesn't exist");
    		}
    		else{
    			console.log(this.responseText);
    			var new_rects = this.responseText.split("\n");
    			for(var i = 0; i < new_rects.length; i++){
    				if(new_rects[i].length != 0){
    					new_rects[i] = new_rects[i].split(" ");
    					rect_in_progress.x1 = Math.floor(imgLeft + (rect.width * parseFloat(new_rects[i][0])));
    					rect_in_progress.y1 = Math.floor(imgTop + (rect.height * parseFloat(new_rects[i][1])));
    					rect_in_progress.x2 = Math.floor(imgLeft + (rect.width * parseFloat(new_rects[i][2])));
    					rect_in_progress.y2 = Math.floor(imgTop + (rect.height * parseFloat(new_rects[i][3])));
    					draw_rect();
    					rects[rects.length-1].addEventListener("contextmenu", destroy_rect);
    				}
    			}
    			rect_in_progress = {x1:0, y1:0, x2:0, y2:0};
    			calc_freq();
    		}
    	}
    }
    var url = "retrieve_rects.php/?user="+curr_user+"&slide="+curr_slide_idx;
    xhttp.open("GET", url, true);
    xhttp.send();
}

function continue_drawing(evt) {
	mre = "M";
	rect_in_progress.x2 = evt.pageX;
	rect_in_progress.y2 = evt.pageY;
	redraw_rect();
}

function finish_drawing(evt) {
	console.log("mouse up");
	mre = "U";
	if(evt.which == 1) {
		rect_in_progress.x2 = evt.pageX;
		rect_in_progress.y2 = evt.pageY;
		redraw_rect();	
		var rip = rect_in_progress;
		var svg = document.getElementById("drawing-svg");
		if (Math.abs((rip.x2-rip.x1)*(rip.y2-rip.y1)) < 20){
			if(click2 == false){
				click2 = true;
				svg.removeEventListener("mousedown", start_drawing);
			}
			else{
				svg.removeChild(rects[rects.length-1]);
				rects.splice(rects.length-1, 1);
				click2 = false;
				svg.removeEventListener("mousemove", continue_drawing);
				svg.removeEventListener("mouseup", finish_drawing);
				svg.removeEventListener("mouseenter", snap_drawing);
				svg.addEventListener("mousedown", start_drawing);
			}
		} else{
			if(click2 == true){
				svg.addEventListener("mousedown", start_drawing);
				click2 = false;
			}
			svg.removeEventListener("mousemove", continue_drawing);
			svg.removeEventListener("mouseup", finish_drawing);
			svg.removeEventListener("mouseenter", snap_drawing);

			var xhttp  = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if(this.readyState == 4 && this.status == 200){
					if(this.responseText == "Success"){
						console.log("Submission success");
					}
					else{
						console.log("Submission failure");
						console.log(this.responseText);
					}
				}
			};
			var slideimg = document.getElementById('img_'+curr_slide_idx);
			var rect = slideimg.getBoundingClientRect();
	    var imgLeft,imgTop; //x and y
	    var scrollTop = document.documentElement.scrollTop?
	    document.documentElement.scrollTop:document.body.scrollTop;
	    var scrollLeft = document.documentElement.scrollLeft?                   
	    document.documentElement.scrollLeft:document.body.scrollLeft;
	    imgTop = rect.top+scrollTop;
	    imgLeft = rect.left+scrollLeft;
	    
	    fx1 = (rip.x1 - imgLeft) / rect.width;
	    fx2 = (rip.x2 - imgLeft) / rect.width;
	    fy1 = (rip.y1 - imgTop) / rect.height;
	    fy2 = (rip.y2 - imgTop) / rect.height;
	    
	    var url = "submit_rect.php/?user="+curr_user+"&slide="+curr_slide_idx+"&x1="+fx1+"&y1="+fy1+"&x2="+fx2+"&y2="+fy2;
	    xhttp.open("GET", url, true);
	    xhttp.send();
	    rect_in_progress = {x1:0, y1:0, x2:0, y2:0};
	}
	
}
}

function snap_drawing(evt) {
	mre = "E";
	rect_in_progress.x2 = evt.pageX;
	rect_in_progress.y2 = evt.pageY;
	redraw_rect();
}

function draw_rect() {
    //var elem = document.createElement("SVG");
    //var child_rect = document.createElement("RECT");
    //child_rect.x = "" + rect_in_progress.x1 + "";
    //child_rect.y = "" + rect_in_progress.y1 + "";
    //child_rect.width = "" + (rect_in_progress.x2 - rect_in_progress.x1) + "";
    //child_rect.height = "" + (rect_in_progress.y2 - rect_in_progress.y1) + "";
    //elem.appendChild(child_rect);
    //rects.push(elem);
    //document.body.appendChild(elem);
    var svg = document.getElementById('drawing-svg');
    var rect = document.createElementNS(ns, 'rect');
    var svgrect = svg.getBoundingClientRect();
    rect.setAttributeNS(null, 'width', (rect_in_progress.x2 - rect_in_progress.x1));
    rect.setAttributeNS(null, 'height', (rect_in_progress.y2 - rect_in_progress.y1));
    rect.setAttributeNS(null, 'x', rect_in_progress.x1-svgrect.left);
    rect.setAttributeNS(null, 'y', rect_in_progress.y1-svgrect.top);
    rect.setAttributeNS(null, 'fill', '#FF0000');
    rect.setAttributeNS(null, 'opacity', '0.3');
    rect.setAttributeNS(null, 'style', 'z-index:20;position:absolute');
    svg.appendChild(rect);
    rects.push(rect);
}

function redraw_rect() {
    //var elem = rects[rects.length-1];
    //var child_rect = elem.children[0];
    //child_rect.width = "" + (rect_in_progress.x2 - rect_in_progress.x1) + "";
    //child_rect.height = "" + (rect_in_progress.y2 - rect_in_progress.y1) + "";
    var rect = rects[rects.length-1];
    //var rect = svg.children[0];
    rect.setAttributeNS(null, 'width', (rect_in_progress.x2 - rect_in_progress.x1));
    rect.setAttributeNS(null, 'height', (rect_in_progress.y2 - rect_in_progress.y1));
}

function destroy_rect(evt) {
	console.log("Destroy");
	var rect = evt.currentTarget;
    //var elem = rect.parentNode;
    var idx = rects.indexOf(rect);
    if(idx != -1) {
    	rects.splice(idx, 1);
    }
    else{
    	console.log("Error: couldn't find rect in array!");
    }
    rect.parentNode.removeChild(rect);
    return false;
}

function start_drawing(evt) {
	console.log("mouse down");
	mre = "D";
	if(evt.which == 1){
		rect_in_progress.x1 = evt.pageX;
		rect_in_progress.y1 = evt.pageY;
		rect_in_progress.x2 = evt.pageX;
		rect_in_progress.y2 = evt.pageY;
		var svg = document.getElementById("drawing-svg");
		svg.addEventListener("mousemove", continue_drawing);
		svg.addEventListener("mouseup", finish_drawing);
		svg.addEventListener("mouseenter", snap_drawing);
		draw_rect();
		rects[rects.length-1].addEventListener("contextmenu", destroy_rect);
	}
}

function click_drawstart(evt){
	console.log("click (start)");
	if(evt.which == 1 && (mre != "U" && rect_in_progress.x1 == 0 && rect_in_progress.y1 == 0)){
		var svg = document.getElementById("drawing-svg");
		start_drawing(evt);
		svg.removeEventListener("click", click_drawstart);
		svg.addEventListener("click", click_drawend);
		svg.removeEventListener("mousedown", start_drawing);
		svg.removeEventListener("mouseup", finish_drawing);
		click2 = true;
	}
}

function click_drawend(evt){
	console.log("click (end)");
	if(evt.which == 1){
		var svg = document.getElementById("drawing-svg");
		svg.removeEventListener("click", click_drawend);
		svg.addEventListener("click", click_drawstart);
		finish_drawing(evt);
		svg.addEventListener("mouseup", finish_drawing);
	}
}

function myLoad(evt = null) {
	console.log("myLoad");
	var slideshow = document.getElementById("slideshow");
	var xhttp = new XMLHttpRequest();
	var loadslide = document.getElementById("loading");
	var loadimg = document.getElementById("loadimg");
	var rectSS = slideshow.getBoundingClientRect();
	var rectBtn = document.getElementById("prev").getBoundingClientRect();
	loadslide.style.height = "" + (window.innerHeight - rectSS.top - 2*rectBtn.height) + "px";
	loadimg.style.height = "" + (window.innerHeight - rectSS.top - 2*rectBtn.height) + "px";
	xhttp.onreadystatechange = function() {
		console.log("onreadystatechange (" + this.readystate + "," + this.status + ")");
		if(this.readyState == 4 && this.status == 200){
			console.log("=== Response text incoming ===");
			console.log(this.responseText);
			console.log("=== Response text finished ===");
			slideshow.innerHTML = this.responseText;
			var slide = document.getElementById("slide_0");
			var img = document.getElementById("img_0");
			var div = document.getElementById("drawing");
			var rectSS = slideshow.getBoundingClientRect();
			var i = 1;
			while(slide != null){
				slide.style.height = "" + (window.innerHeight - rectSS.top - 2*rectBtn.height) + "px";
				img.style.height = "" + (window.innerHeight - rectSS.top - 2*rectBtn.height) + "px";
				img.ondragstart = function() { return false; };
				slide = document.getElementById("slide_" + i);
				img = document.getElementById("img_" + i);
				i++;
			}
			var rectSS = slideshow.getBoundingClientRect();
			var svg = document.createElementNS(ns, 'svg');
			svg.setAttributeNS(null, 'width', '100%');
			svg.setAttributeNS(null, 'height', '100%');
			svg.setAttributeNS(null, 'style', 'z-index:10; position:absolute;');
			svg.setAttributeNS(null, 'id', 'drawing-svg');
			svg.addEventListener("mousedown", start_drawing);
			svg.addEventListener("click", click_drawstart);
			div.appendChild(svg);
			div.style.width = "" + (rectSS.width) + "px";
			console.log("rectSS.height: "+rectSS.height);
			div.style.height = "" + (rectSS.height) + "px";
			get_rects();
		}
	};
	xhttp.open("GET", "slides.php", true);
	xhttp.send();
	var next_btn = document.getElementById("next");
	var prev_btn = document.getElementById("prev");
	var user_btn = document.getElementById("user_submit");
	var slide_btn = document.getElementById("slide_submit");
	var erase_btn = document.getElementById("erase");
	if(next_btn == null){
		console.log("#next is null");
	}
	if(prev_btn == null){
		console.log("#prev is null");
	}
	if(user_btn == null){
		console.log("#user_submit is null");
	}
	if(slide_btn == null){
		console.log("#slide_submit is null");
	}
	if(erase_btn == null){
		console.log("#erase is null");
	}
	next_btn.addEventListener("click", next_slide);
	prev_btn.addEventListener("click", prev_slide);
	user_btn.addEventListener("click", set_user);
	slide_btn.addEventListener("click", set_slide);
	erase_btn.addEventListener("click", erase_rects);
	var user = document.getElementById("user");
	user.value = curr_user;
	var slideno = document.getElementById("slideno");
	slideno.value = 0;
}

console.log("START!!!");

if(window.attachEvent) {
	window.attachEvent('onload', myLoad);
} else if(window.onload) {
	var curronload = window.onload;
	var newonload = function(evt) {
		curronload(evt);
		myLoad(evt);
	};
	window.onload = newonload;
} else {
	window.onload = myLoad;
}


