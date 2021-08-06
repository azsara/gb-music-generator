"use strict";

// Set the file we're going to open
//let url = "Audio/ADpickup.mod"
let url = "Audio/ADpickup.mod";

// This converts the numbers to strings of base-16 hex values.
// If you can figure out how to make the columns more distinct, that would be neat.
function bufferToHex(buffer) {
	return [...buffer]
		.map(b =>b.toString(16).padStart(2, "0")) // Convert the numbers to hex, padding them with a zero if they are 0A or below.
		.join(" ") // join the 2-digit numbers together, with a space between them
		.match(/.{1,48}/g) // chunk the string into 48-character chunks
		.join("<br>\n"); // join the chunks together again, with a new linebreak between them
}

let Pattern = class {
    constructor(p, l) {
	        this.level = l;
	        this.freq = 1;
		this.pos = [];
		this.pos.push(p); 
	}
        incr(p) {
	    // Skip the overlapping patterns 
	    if (p >= this.pos[this.freq - 1] + this.level) {
	        this.pos.push(p);
	        this.freq = this.freq + 1;
	    }
	}
        getf() {
	        return this.freq;
	}
        getp() {
	        return this.pos;
	}
}

var levelMap = new Map(); //Empty Map
var splited;
var hexNew = "";
var hexNew1 = "";

function locateOnePatterns() {

    var map = new Map();

    // console.log("locateOnePatterns BEGIN");
	
	for (let i = 0; i < splited.length; i++) {
	    var key = splited[i];
		if (map.has(key)) {
		    map.get(key).incr(i);
		} 
		else {
		    let p = new Pattern(i, 1);
		    map.set(key, p);
		}
	}
	
	let repeats = 0;
	let unique = 0;
	for (const [key,value] of map){
	    let f = map.get(key).getf();
	    let p = map.get(key).getp();
	    if (f == 1) {
		    map.delete(key);
		    unique += 1;
	    } else {
		//console.log(`key: ${key}, value: ${f}, pos: ${p}`);
		    repeats += 1;
	    }
	}

	levelMap.set(1, map);

	console.log(`Located patterns at length 1: count ${repeats}`);
}

function locateNextPatterns(level) {

    //console.log("locateNextPatterns ${level} BEGIN");

    var cmap = levelMap.get(level);
    var nmap = new Map();

    for (const [key,value] of cmap) {
	    let f = cmap.get(key).getf();
	    let p = cmap.get(key).getp();
	    for (const pos of p) {
		    if (pos + level > splited.length)
		        break;
		    var newkey = key + ' ' + splited[pos + level]; // add one more value
            if (nmap.has(newkey)) {
                nmap.get(newkey).incr(pos);
            } else {
                let newp = new Pattern(pos, level);
                nmap.set(newkey, newp);
            }     
	}
	// console.log(nmap.size)
    }

    let repeats = 0;
    let unique = 0;
    for (const [key,value] of nmap){
	    let f = nmap.get(key).getf();
	    let p = nmap.get(key).getp();
	    if (f == 1) {
	        nmap.delete(key);
	        unique += 1;
	    } else {
	        //console.log(`key: ${key}, value: ${f}, pos: ${p}`);
	        repeats += 1;
	    }
    }

    levelMap.set(level + 1, nmap);
    // console.log(`Located patterns at length ${level}: count ${repeats}`);
}

function locatePatterns(hex) {

    hex = hex.replace(/\<br\>/g,"");
    hex = hex.replace(/[\n\r]+/g, '');
    splited = hex.split(" ");
    // console.log("locateAllPatterns BEGIN");
    // console.log(hex.length);
    // console.log(splited.length);

	locateOnePatterns();
	let total = 0;
	for(let i = 1 ;; i++){
	    locateNextPatterns(i);
	    total += levelMap.get(i+1).size;
	    // console.log(`locateNextPatterns: level ${i+1} count ${levelMap.get(i+1).size}`);
	    if (levelMap.get(i+1).size == 0)
		    break;
	}

	console.log("Total number of patterns: ", total);
}

function randompattern(len) {
	var s = '';
	for(let i = 0; i < len; i++){
		function decimalToHexString(number) {
			if (number < 0) {	
				number = 0xFFFFFFFF + number + 1;
			}
			//onsole.log(number);
			return number.toString(16).toLowerCase();
		}

		let new_s = decimalToHexString(Math.floor(Math.random()*255));
		if(new_s.length == 1){
			new_s = new_s.concat("0")
		}
		s = s.concat(new_s); //at the locations
		s = s.concat(" "); //at the locations
	}
	// console.log(`new pattern: ${s}`);
	return s;
}

function wobblerandom(hex, len) {
	//random repeating strings of length len, and replace those repeat strings with random values
	var map = levelMap.get(len);
	if (map.size == 0) {
		console.log("Empty map; nothing done")
		return;
	}

	// Pick a random string to replace
	// var index = 0; //replace the first pattern of the given length
	var index = Math.floor(Math.random()*map.size);
	// console.log("index", index);

	var i = 0;
	var indexkey = '';
	for (const [key,value] of map){
		if (i == index) {
		    indexkey = key;
		}
		i = i + 1;
	}

	var f = map.get(indexkey).getf();
	var p = map.get(indexkey).getp();
	var new_s = randompattern(len);

        console.log(`Replace pattern: ${indexkey} with ${new_s} at ${f} locations: ${p}`);

	for (let j = 0; j < f; j++) {
	    for (let k = 0; k < len; k++) {
		let pos = p[j];
		splited[pos + k] = new_s.substring(k*3, k*3+2);
	    }
	}

	for (let j = 0; j < splited.length; j++) {
	    hexNew = hexNew.concat(splited[j]);
	    hexNew1 = hexNew1.concat(splited[j]);
	    if (j == splited.length - 1) 
		break;
	    hexNew = hexNew.concat(" ");
	    if (j % 16 == 15) {
		hexNew = hexNew.concat("<br>");
		hexNew = hexNew.concat("\n");
	    }
	}
}

function compareHex(a, b, len)
{
    var i = 0;
    var j = 0;
    var result1 = "";
    var result2 = "";

    if (a.length != b.length) {
	console.log(`length is difference, ${a.length}, ${b.length}`);
	return;
    }

    while (i < b.length) {
	if (a[i] != b[i]) {
	    result1 += a[i];
	    result2 += b[i];
	}
	i++
    }
    console.log("Diff length", result1.length);
    console.log("Old", result1);
    console.log("New", result2);
    return;
}

// This loads the mod file from disk, via an http request.
// Don't forget to run a local webserver! python -m http.server
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; // NEW AZ
let mod_file_request = new XMLHttpRequest();
mod_file_request.open('get', url, true);

// XMLHttpRequest can automatically convert our data into an ArrayBuffer
mod_file_request.responseType = 'arraybuffer';

// The loading happens in a callback function, so it doesn't stop things from
// happening on the page while the file loads.
mod_file_request.onload = function(event){
	//import .mod file
	let trackerData = mod_file_request.response;

	// If this is true, then the file has been loaded as
	// an ArrayBuffer. For more on ArrayBuffers, consult https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
	if (trackerData) {
		// The data is put into a ArrayBuffer view of type Uint8Array
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
		let byteData = new Uint8Array(trackerData);
		// This is a fixed-length array of 8-bit numbers.

		// This is just here to display the data on the page.
		let hex = bufferToHex(byteData)
		document.getElementById("hexx").innerHTML = hex;

		// 1. locate the music pattern data
		locatePatterns(hex);

		// 2. edit the music pattern data
		// Find the size of file
		let len = 4; //replace a pattern with length 4
		wobblerandom(hex, len);
		//compareHex(hex, hexNew, len); //compare the old and new file data and print the difference
		hex = hexNew;

		// 3 display the new file data
		console.log(hex);

		// 4. we won't write it out to disk yet, because that's actually going to be a separate part of the system
		// Though if you really want to write it out to a file to listen to, you can.

		function hexStringToByte(str) {
		    if (!str) {
			return new Uint8Array();
		    }

		    var a = [];
		    for (var i = 0, len = str.length; i < len; i+=2) {
			a.push(parseInt(str.substr(i,2),16));
		    }

		    return new Uint8Array(a);
		}

		download(new Blob([hexStringToByte(hexNew1)]), "ADpickup-1.mod", "application/octet-stream");
	}
}
mod_file_request.send();
console.log(mod_file_request);
