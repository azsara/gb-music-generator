"use strict";

// Set the file we're going to open
let url = "Audio/ADpickup.mod"

// This converts the numbers to strings of base-16 hex values.
// If you can figure out how to make the columns more distinct, that would be neat.
function bufferToHex(buffer) {
	return [...buffer]
		.map(b =>b.toString(16).padStart(2, "0")) // Convert the numbers to hex, padding them with a zero if they are 0A or below.
		.join(" ") // join the 2-digit numbers together, with a space between them
		.match(/.{1,48}/g) // chunk the string into 48-character chunks
		.join("<br>\n"); // join the chunks together again, with a new linebreak between them
}

// This loads the mod file from disk, via an http request.
// Don't forget to run a local webserver! python -m http.server
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
		// Print the data to the console.
		console.log(hex);

		// 1. locate the music pattern data

		// 2. edit the music pattern data

		// For random numbers, try Math.random()
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

		// 3 display the new file data

		// 4. we won't write it out to disk yet, because that's actually going to be a separate part of the system
		// Though if you really want to write it out to a file to listen to, you can.
	}
}
mod_file_request.send();
console.log(mod_file_request);
