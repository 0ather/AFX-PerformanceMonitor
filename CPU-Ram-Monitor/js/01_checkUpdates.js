/**
 * Check github updates 
 */
function checkUpdates() {
	var getGithub = new XMLHttpRequest(),
	    jsonResponse,
	    prev_pushed_at,
	    pushed_at;

	getGithub.open("GET", "https://api.github.com/repos/0ather/AFX-Script_ConnectLayers", false);

	getGithub.onreadystatechange = function() {
	    jsonResponse = JSON.parse(getGithub.responseText);
	    pushed_at = jsonResponse.pushed_at;
	}

	getGithub.send();

	console.log(localStorage);

	if (localStorage.length !== 0) {
		// Value found in localStorage
		// Get it (prev value) and compare with new
		prev_pushed_at = localStorage.getItem("gitHub-pushed_at");

		if ( prev_pushed_at == pushed_at ) {
			// No updates
			console.log("No updates");
		} else {
			// A new update available
			console.log("A new update is available!");
		}
	}

	// Store pushed_at value in localStorage
	localStorage.setItem("gitHub-pushed_at", pushed_at);
}