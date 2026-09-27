/**
 * Disk Cache monitor
 *
 * @param {array} loaded array
 * @param {object} CSInterface object
 */
var diskCacheMonitor = function(loaded, csInterface) {
	'use strict';

	var diskCacheDisplayInterval,
		// Rescan the folder only when it changed, and not more often than this
		MIN_SCAN_GAP	= 5000,
		// Safety rescan (and re-read of the After Effects prefs) in case a change was missed
		FULL_SCAN_GAP	= 60000,
		needsScan		= true,
		scanning		= false,
		lastScan		= 0,
		lastPrefsRead	= 0,
		watcher			= null,
		watchedPath		= null;

	var hostEnvironment 	= JSON.parse(window.__adobe_cep__.getHostEnvironment()),
		afxVersion			= hostEnvironment.appVersion.toString(),
		diskCacheMonitorGui = new GUI(loaded, "#disk-cache-container", "disk-cache", "", ""),
		diskCachePath,
		diskCacheSize,
		cacheMonitorLoaded;

	/**
	 * Keep only "major.minor" of the After Effects version (ex: "13.5.1" -> "13.5", "25.2.0x16" -> "25.2")
	 *
	 * @param {string} After Effects version
	 */
	function shortVersion(version) {
		var match = /^(\d+)\.(\d+)/.exec(version);

		return match ? match[1] + "." + match[2] : version;
	}

	/**
	 * Find the disk cache folder for this After Effects version
	 * If "major.minor" doesn't exist, fall back on the latest folder of the same major version
	 *
	 * @param {string} "Adobe/After Effects" folder inside the disk cache folder
	 */
	function findCacheFolder(baseFolder) {
		var fs			= require('fs'),
			path		= require('path'),
			version		= shortVersion(afxVersion),
			major		= version.split(".")[0],
			candidates;

		if ( fs.existsSync(path.join(baseFolder, version)) ) {
			return path.join(baseFolder, version);
		}

		try {
			candidates = fs.readdirSync(baseFolder).filter(function(name) {
				return name.split(".")[0] === major;
			}).sort(function(a, b) {
				return parseFloat(b) - parseFloat(a);
			});
		} catch (e) {
			candidates = [];
		}

		return candidates.length ? path.join(baseFolder, candidates[0]) : path.join(baseFolder, version);
	}

	/**
	 * Get disk cache prefs form after effects
	 */
	function getDiskCachePrefs() {
		//var csInterface = new CSInterface();
		lastPrefsRead = Date.now();

		csInterface.evalScript('app.preferences.getPrefAsString("Disk Cache Controls", "Folder 7");', function(result) {
			diskCachePath = findCacheFolder(result+"/Adobe/After Effects");
			needsScan = true;
			watchCacheFolder();
		});
		csInterface.evalScript('app.preferences.getPrefAsString("Disk Cache Controls", "Max Size 3");', function(result) {
			diskCacheSize = result;
			needsScan = true;
		});
	}

	/**
	 * Watch the cache folder: any change inside it asks for a new measure
	 * (the whole folder is only read again when something changed)
	 */
	function watchCacheFolder() {
		if ( watcher && watchedPath === diskCachePath ) return;

		stopWatching();

		try {
			watcher = require('fs').watch(diskCachePath, { recursive: true }, function() {
				needsScan = true;
			});
			watchedPath = diskCachePath;
			watcher.on('error', stopWatching);
		} catch (e) {
			// Folder doesn't exist yet - try again at the next safety rescan
			watcher = null;
		}
	}

	function stopWatching() {
		if (watcher) watcher.close();
		watcher = null;
		watchedPath = null;
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

		scanning = true;

		getCurrentCacheUsage(diskCachePath, function(err, size) {
			scanning = false;
			lastScan = Date.now();

			// Display may have been removed while reading the folder
			if (!document.getElementById(textid)) return;

			if (err) {
				// Folder not found (cache empty or not created yet)
				console.log("Disk cache folder not found: " + diskCachePath);
				size = 0;
			}

			var sizeMb 		= size/1024/1024,
				sizeGB 		= size/1024/1024/1024,
				percentage 	= sizeGB/diskCacheSize*100;

			if (sizeGB > 1) {
				document.getElementById(textid).innerHTML = "Disk Cache usage: "+(sizeGB.toFixed(2))+"GB / "+diskCacheSize+"GB";
			} else {
				document.getElementById(textid).innerHTML = "Disk Cache usage: "+(sizeMb.toFixed(2))+"MB / "+diskCacheSize+"GB";
			}

			diskCacheMonitorGui.StepSimpleColor(percentage);

			if (cacheMonitorLoaded==0) {
	  			cacheMonitorLoaded = 1;

	  			// change loaded value from 0 to 1
				console.log("3 Disk Cache Monitor Loaded");
				
				setLoadingText("loading-cache", "Disk Cache Monitor Loaded");
				
				loaded[3] = 1;
		  	}
		});
	}

	/**
	 * Manual cache purge
	 */
	function manualPurge() {
		csInterface.evalScript("app.executeCommand(10200)", function() {
			// Show the new size right away
			needsScan = true;
			lastScan = 0;
		});
	}

	/**
	 * Display
	 *
	 * @param {string} span id for the feedback text (usage)
     * @param {number} refresh interval - not used, the folder is measured only when it changes
	 */
	this.diskCacheDisplay = function(textid, refresh) {
		cacheMonitorLoaded = 0;
		needsScan = true;
		lastScan = 0;

		setLoadingText("loading-cache", "Loading Disk Cache Monitor...");

		diskCacheMonitorGui.addSimpleRow();
		diskCacheMonitorGui.addButton(1);
		getDiskCachePrefs();

		// Extra: purge cache on click
		$('#disk-cache-button-1').click(function() {
			manualPurge();
		});

		// Cheap check every second - the folder is only read when needed
		diskCacheDisplayInterval = setInterval(function() {
			var now = Date.now();

			// Safety: re-read the prefs (the user may have changed the cache folder) and measure again
			if ( now - lastPrefsRead >= FULL_SCAN_GAP ) {
				getDiskCachePrefs();
			}

			// Wait for the After Effects prefs (evalScript is asynchronous)
			if ( !diskCachePath || !diskCacheSize ) return;

			if ( needsScan && !scanning && now - lastScan >= MIN_SCAN_GAP ) {
				needsScan = false;
				getCacheUsage(diskCachePath, diskCacheSize, textid);
			}
		}, 1000);
	}

	/**
	 * Delete the cache disk display informations
	 */
	this.diskCacheUndisplay = function() {
		diskCacheMonitorGui.removeRow();
		clearInterval(diskCacheDisplayInterval);
		stopWatching();
	}
}