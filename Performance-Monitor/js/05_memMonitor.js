/**
 * Memory monitoring
 *
 * @param {node} os from nodejs
 * @param {array} loaded array
 */
 var memMonitor = function(os, loaded) {
 	'use strict';

 	var memDisplayInterval;

	var execFile 		= require('child_process').execFile,
		requestInProgress = false;

	// Windows and OSX (total memory in bytes)
	var totalMemory 	= os.totalmem(),
		memMonitorGui 	= new GUI(loaded, "#memory-container", "memory", "step", 2);

	/**
     * Memory utilisation for windows (nodejs)
     */
	function memoryUtilisationWIN() {
		// freeMemory in bytes
		var freeMemory 			= os.freemem(),
			freememPercentage 	= Math.floor( freeMemory / totalMemory *100 );

		return freememPercentage;
	}

	/**
     * Memory utilisation for OSX (with vm_stat), sent to the callback in percent
     * Lines are read by their name, as their order changes between macOS versions
     */
	function memoryUtilisationOSX(callback) {
		execFile('/usr/bin/vm_stat', function(error, stdout) {
			if (error) return callback(null);

			function readPages(label) {
				var match = new RegExp(label + ':\\s*(\\d+)').exec(stdout);

				return match ? parseInt(match[1], 10) : 0;
			}

			var pageSizeMatch	= /page size of (\d+) bytes/.exec(stdout),
				pagesize		= pageSizeMatch ? parseInt(pageSizeMatch[1], 10) : 4096,
				// Free memory = free + speculative + inactive pages
				totalfree		= ( readPages("Pages free") + readPages("Pages speculative") + readPages("Pages inactive") ) * pagesize;

			callback(Math.round( (totalMemory - totalfree) / totalMemory * 100 ));
		});
	}

	/**
     * Display
     *
     * @param {string} span id for the feedback text (percentage of use)
     * @param {number} refresh interval - default 2000
     */
	this.memoryDisplay = function(textid, refresh) {
		var ramMonitorLoaded = 0;

		setLoadingText("loading-ram", "Loading RAM Monitor...");

		memMonitorGui.addRow(1);

		memMonitorGui.StepSize();
		window.addEventListener('resize', function() { memMonitorGui.StepSize(); });

		if ( os.type().indexOf("Windows") > -1 ) {
			// Windows
			memDisplayInterval = setInterval(function() {
				var currentValueMem = 100 - memoryUtilisationWIN();

				document.getElementById(textid).innerHTML = currentValueMem + "% MEMORY Usage.";
				memMonitorGui.StepColor(currentValueMem);

				if (ramMonitorLoaded==0) {
		  			ramMonitorLoaded = 1;

		  			// change loaded value from 0 to 1
		  			console.log("1 RAM Monitor Loaded");
					setLoadingText("loading-ram", "RAM Monitor Loaded");
					loaded[1] = 1;
		  		}
			}, refresh);
		} else {
			// Mac OSX
			memDisplayInterval = setInterval(function() {
				// Skip this tick if the previous vm_stat is still running
				if (requestInProgress) return;
				requestInProgress = true;

				memoryUtilisationOSX(function(currentValueMem) {
					requestInProgress = false;

					// Display may have been reset while waiting
					if (!document.getElementById(textid)) return;

					if (currentValueMem === null) {
						document.getElementById(textid).innerHTML = "MEMORY usage unavailable.";
					} else {
						document.getElementById(textid).innerHTML = currentValueMem + "% MEMORY Usage.";
						memMonitorGui.StepColor(currentValueMem);
					}

					if (ramMonitorLoaded==0) {
			  			ramMonitorLoaded = 1;

			  			// change loaded value from 0 to 1
			  			console.log("1 RAM Monitor Loaded");
						setLoadingText("loading-ram", "RAM Monitor Loaded");
						loaded[1] = 1;
			  		}
				});
			}, refresh);
		}
	}

	/**
	 * Reset the memory display informations (to change the refresh interval)
	 */
	this.memoryResetDisplay = function() {
    	memMonitorGui.removeRow();
    	clearInterval(memDisplayInterval);
    }
 }