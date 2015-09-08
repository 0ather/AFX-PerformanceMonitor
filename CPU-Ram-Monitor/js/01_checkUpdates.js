/**
 * Check github updates 
 */
function checkUpdates() {
	var getGithub 	= new XMLHttpRequest(),
		getLocal 	= new XMLHttpRequest(),
		xmlGithub,
		xmlLocal,
		versionGithub,
		versionLocal;

	getGithub.open("GET", "https://raw.githubusercontent.com/0ather/AFX-CpuRamMonitor/master/CPU-Ram-Monitor/CSXS/manifest.xml", false);
	getLocal.open("GET", "./CSXS/manifest.xml", false);

	getGithub.onreadystatechange = function() {
		if ( getGithub.readyState == 4 ) {
		    xmlGithub = getGithub.responseText;
		    var startIndex = xmlGithub.indexOf("ExtensionBundleVersion");

		    versionGithub = xmlGithub.substring(startIndex+24, startIndex+29);
		}
	}

	getLocal.onreadystatechange = function() {
		if ( getLocal.readyState == 4 ) {
			xmlLocal = getLocal.responseText;
			var startIndex = xmlGithub.indexOf("ExtensionBundleVersion");

			versionLocal = xmlLocal.substring(startIndex+24, startIndex+29);
		}
	}

	getGithub.send();
	getLocal.send();

	if ( versionLocal !== versionGithub ) {
		console.log("A new update is available!");
		document.getElementById("updates").innerHTML = "A new update is available! <a onclick=\"window.cep.util.openURLInDefaultBrowser('https://github.com/0ather/AFX-CpuRamMonitor')\" href=\"#\">Check on Github.</a>";
	} else {
		console.log("No updates");
	}
}