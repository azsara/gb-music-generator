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
    constructor(p) {
	    this.freq = 1;
		this.pos = [];
		this.pos.push(p); 
	}
        incr(p) {
	        this.pos.push(p);
	        this.freq = this.freq + 1;
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

function locateOnePatterns() {

    var map = new Map();

	console.log("locateOnePatterns BEGIN");
	
	for (let i = 0; i < splited.length; i++) {
	    var key = splited[i];
		if (map.has(key)) {
		    map.get(key).incr(i);
		} 
        else {
		    let p = new Pattern(i);
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
	console.log(`locateOnePatterns: ${unique} ${repeats} END`);
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
                let newp = new Pattern(pos);
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
	        // console.log(`key: ${key}, value: ${f}, pos: ${p}`);
	        repeats += 1;
	    }
    }

    levelMap.set(level + 1, nmap);
    //console.log(`locateNextPatterns: ${level} ${unique} ${repeats} END`);

    //console.log("locateNextPatterns END");
}

function locatePatterns(hex) {

    hex = hex.replace(/\<br\>/g,"");
    hex = hex.replace(/[\n\r]+/g, '');
    splited = hex.split(" ");
    console.log("locateAllPatterns BEGIN");
    console.log(hex.length);
    console.log(splited.length);

	locateOnePatterns();
	let total = 0;
	for(let i = 1 ;; i++){
	    locateNextPatterns(i);
	    total += levelMap.get(i+1).size;
	    console.log(`locateNextPatterns: ${i+1} ${levelMap.get(i+1).size} ${total} END`);
	    if (levelMap.get(i).size == 0)
		    break;
	}

	console.log("locateAllPatterns BEGIN");
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
	console.log(`new pattern: ${s}`);
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
	//index = Math.floor(Math.random()*map.size);
	var index = 0; //replace the first pattern of the given length

	var i = 0;
	var indexkey = '';
	for (const [key,value] of map){
		if (i != index) {
			i = i + 1;
		}
		indexkey = key;
	}

	var f = map.get(indexkey).getf();
	var p = map.get(indexkey).getp();

	console.log(`replace pattern: ${indexkey} at ${p}`);

	var new_s = randompattern(len);

	for (let j = 0; j < f; j++) {
		let pos = p[j];
		//console.log(pos)
		let i = 0;
		let k = 0;
		while (pos > 0) {
			i = i + 3;
			pos = pos - 1;
			k = k + 1;
			if (k == 16) {
				i = i + 5;
				k = 0;
			}
		}
		//console.log(new_s)
		//console.log(new_s.length)
		//console.log(i)
		//console.log(hex.substring(0, i))
		//console.log(hex.substring(i - 1 + new_s.length));
		hex = hex.substring(0, i) + new_s + hex.substring(i + new_s.length);
		//break;
	}
	console.log(hex)
}


// This loads the mod file from disk, via an http request.
// Don't forget to run a local webserver! python -m http.server
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; // NEW AZ
let mod_file_request = new XMLHttpRequest();
mod_file_request.open('get', url, true);

// XMLHttpRequest can automatically convert our data into an ArrayBuffer
mod_file_request.responseType = 'arraybuffer';
console.log("Hello1");
// The loading happens in a callback function, so it doesn't stop things from
// happening on the page while the file loads.
mod_file_request.onload = function(event){
	//import .mod file
	let trackerData = mod_file_request.response;
	console.log("Hello2");
	console.log(trackerData);
	// If this is true, then the file has been loaded as
	// an ArrayBuffer. For more on ArrayBuffers, consult https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
	if (trackerData) {
		// The data is put into a ArrayBuffer view of type Uint8Array
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
		let byteData = new Uint8Array(trackerData);
		console.log('Hello4');
		console.log('Hello5')
		// This is a fixed-length array of 8-bit numbers.


		// This is just here to display the data on the page.
		let hex = bufferToHex(byteData)
		document.getElementById("hexx").innerHTML = hex;
		// Print the data to the console.
		//console.log(hex);
		//console.log(parseInt("0x"+hex[0]+hex[1]));
		// 1. locate the music pattern data
		locatePatterns(hex);

		// 2. edit the music pattern data
		// Find the size of file
		wobblerandom(hex, 2) //replace pattern with length 2

		// console.log(hex[hex.length-1]);
		// console.log(hex[hex.length-2]);
		/*
		let s = ''
		// TBD(Length of the new pattern)
		for(let i = 0; i<11;i++){
			function decimalToHexString(number)
			{
			if (number < 0)
			{
				number = 0xFFFFFFFF + number + 1;
			}
			console.log(number);
			return number.toString(16).toUpperCase();
			}
			let new_s = decimalToHexString(Math.floor(Math.random()*255));
			if(new_s.length == 1){
				new_s = new_s.concat("0")
			}
			s = s.concat(new_s);
			s = s.concat(" ");
			
		}
		console.log(s);
		console.log(parseInt("0x"+s[0]+s[1]));
		// Replace the beginning of hex with random string
		//TBD (Replace location)
		hex = s + hex.substring(s.length);
		*/

		// For random numbers, try Math.random()
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

		// 3 display the new file data
		// console.log(hex);
		// 4. we won't write it out to disk yet, because that's actually going to be a separate part of the system
		// Though if you really want to write it out to a file to listen to, you can.
	}
}
mod_file_request.send();
console.log(mod_file_request);
console.log("Hello3");