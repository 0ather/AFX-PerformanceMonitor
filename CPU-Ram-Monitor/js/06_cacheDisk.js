/**
 * Disk Cache monitor
 *
 * @param {array} loaded array
 * @param {object} CSInterface object
 */
var diskCacheMonitor = function(loaded, csInterface) {
	'use strict';

	var diskCacheDisplayInterval;

	var hostEnvironment 	= JSON.parse(window.__adobe_cep__.getHostEnvironment()),
		afxVersion			= hostEnvironment.appVersion.toString(),
		diskCacheMonitorGui = new GUI(loaded, "#disk-cache-container", "disk-cache", "", ""),
		diskCachePath,
		diskCacheSize;

	/**
	 * Get disk cache prefs form after effects
	 */
	function getDiskCachePrefs() {
		// Condition for afxVersion (if version 13.5.1, the folder will still be 13.5)
		if ( afxVersion.includes("13.5") && (afxVersion.indexOf(".") != afxVersion.lastIndexOf(".")) ) {
			// If afxVersion similar to xx.x.x - delete last number
			afxVersion = afxVersion.substr(0, afxVersion.lastIndexOf("."));
		}

		//var csInterface = new CSInterface();
		csInterface.evalScript('app.preferences.getPrefAsString("Disk Cache Controls", "Folder 7");', function(result) {
			diskCachePath = result+"/Adobe/After Effects/"+afxVersion;
		});
		csInterface.evalScript('app.preferences.getPrefAsString("Disk Cache Controls", "Max Size 3");', function(result) {
			diskCacheSize = result;
		});
	}

	/**
	 * Get current cache usage (in bytes)
	 *
	 * @param {string} Disk Cache path on local machine
	 * @param {string} Disk Cache max size on local machine
	 * @param {string} Textid to display informations
	 */
	function getCacheUsage(diskCachePath, diskCacheSize, textid) {
		var getCurrentCacheUsage = require('get-folder-size');

		getCurrentCacheUsage(diskCachePath, function(err, size) {
			if (err) { throw err; }

			var sizeMb 		= size/1024/1024,
				sizeGB 		= size/1024/1024/1024,
				percentage 	= sizeGB/diskCacheSize*100;

			if (sizeGB > 1) {
				document.getElementById(textid).innerHTML = "Disk Cache usage: "+(sizeGB.toFixed(2))+"Go / "+diskCacheSize+"Go";
			} else {
				document.getElementById(textid).innerHTML = "Disk Cache usage: "+(sizeMb.toFixed(2))+"Mb / "+diskCacheSize+"Go";
			}

			diskCacheMonitorGui.StepSimpleColor(percentage);

			// change loaded value from 0 to 1
			loaded[2] = 1;
		});
	}

	/**
	 * Manual cache purge
	 */
	function manualPurge() {
		csInterface.evalScript("app.executeCommand(10200)");
	}

	/**
	 * Display
	 *
	 * @param {string} span id for the feedback text (usage)
     * @param {number} refresh interval - default 2000
	 */
	this.diskCacheDisplay = function(textid, refresh) {
		diskCacheMonitorGui.addSimpleRow();
		diskCacheMonitorGui.addButton(1);
		getDiskCachePrefs();

		// Extra: purge cache on click
		$('#disk-cache-button-1').click(function() {
			manualPurge();
		});

		// Interval for current cache usage
		diskCacheDisplayInterval = setInterval(function() {
			getCacheUsage(diskCachePath, diskCacheSize, textid);
		}, refresh);
	}

	/**
	 * Delete the cache disk display informations
	 */
	this.diskCacheUndisplay = function() {
		diskCacheMonitorGui.removeRow();
		clearInterval(diskCacheDisplayInterval);
	}
}