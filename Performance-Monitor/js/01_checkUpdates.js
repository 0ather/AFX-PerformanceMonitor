/**
 * Check github updates
 */
function checkUpdates() {
	'use strict';

	var githubUrl	= "https://raw.githubusercontent.com/0ather/AFX-PerformanceMonitor/master/Performance-Monitor/CSXS/manifest.xml",
		localUrl	= "./CSXS/manifest.xml",
		versionGithub,
		versionLocal,
		pending		= 2;

	/**
	 * Read ExtensionBundleVersion="x.y.z" from a manifest
	 *
	 * @param {string} manifest xml content
	 */
	function readVersion(xml) {
		var match = /ExtensionBundleVersion="([^"]+)"/.exec(xml || "");

		return match ? match[1] : null;
	}

	/**
	 * Return true if version a is higher than version b (ex: "1.10.0" > "1.9.2")
	 */
	function isNewer(a, b) {
		var partsA = a.split("."),
			partsB = b.split(".");

		for ( var i = 0; i < Math.max(partsA.length, partsB.length); i++ ) {
			var numA = parseInt(partsA[i], 10) || 0,
				numB = parseInt(partsB[i], 10) || 0;

			if (numA !== numB) return numA > numB;
		}
		return false;
	}

	/**
	 * Called when each request is done - compare once both versions are known
	 */
	function compareVersions() {
		pending--;
		if (pending > 0) return;

		if ( versionGithub && versionLocal && isNewer(versionGithub, versionLocal) ) {
			console.log("A new update is available! " + versionLocal + " -> " + versionGithub);
			document.getElementById("updates").innerHTML = "A new update is available! <a onclick=\"window.cep.util.openURLInDefaultBrowser('https://github.com/0ather/AFX-PerformanceMonitor')\" href=\"#\">Check on Github.</a>";
		} else {
			console.log("No updates");
		}
	}

	/**
	 * Get a file and send its version to the callback
	 */
	function getVersion(url, callback) {
		var request = new XMLHttpRequest();

		request.open("GET", url, true);
		request.onreadystatechange = function() {
			if ( request.readyState == 4 ) {
				// status 0 is what a local file:// request returns
				if ( request.status == 200 || request.status == 0 ) {
					callback(readVersion(request.responseText));
				}
				compareVersions();
			}
		};
		request.send();
	}

	getVersion(githubUrl, function(version) { versionGithub = version; });
	getVersion(localUrl, function(version) { versionLocal = version; });
}
