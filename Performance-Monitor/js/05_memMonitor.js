/**
 * Memory monitoring
 *
 * @param {node} os from nodejs
 * @param {array} loaded array
 */
 var memMonitor = function(os, loaded) {
 	'use strict';

 	var memDisplayInterval;

	var child_process 	= require('child_process'),
		execFile 		= require('child_process').execFile;

	// Windows
	var totalMemoryWin 	= os.totalmem(),
		memMonitorGui 	= new GUI(loaded, "#memory-container", "memory", "step", 2);

	// OSX
	var gosize 			= 1024*1024*1024,
		totalMemoryOsx,
		pagesize,
		pagesfree,
		pagesactive,
		pagesinactive,
		pagesspeculative,
		pageswireddown,
		free,
		inactive,
		totalfree,
		wired,
		active,
		totalused;

	/**
     * Memory utilisation for windows (nodejs)
     */
	function memoryUtilisationWIN() {
		// freeMemory in bytes
		var freeMemory 			= os.freemem(),
			freememPercentage 	= Math.floor( freeMemory / totalMemoryWin *100 );

		return freememPercentage;
	}

	/**
     * Memory amount on OSX
     */
	function getMemoryAmountOSX() {
		child_process.exec('sysctl hw.memsize', function (err, data) {
		    totalMemoryOsx = (parseInt(data.split(':')[1]))/gosize;
		});
	}

	/**
     * Memory utilisation for OSX (with vm_stat)
     */
	function getVmstatsInfosOSX() {
		execFile('/usr/bin/vm_stat', function(error, stdout, stderr) {
			pagesize 			= parseInt(stdout.split('\n')[0].split('of')[1]);
			pagesfree 			= parseInt(stdout.split('\n')[1].split(':')[1]);
			pagesactive 		= parseInt(stdout.split('\n')[2].split(':')[1]);
			pagesinactive 		= parseInt(stdout.split('\n')[3].split(':')[1]);
			pagesspeculative 	= parseInt(stdout.split('\n')[4].split(':')[1]);
			pageswireddown 		= parseInt(stdout.split('\n')[6].split(':')[1]);

			free 				= ( pagesfree + pagesspeculative ) * pagesize / gosize,
			inactive 			= pagesinactive * pagesize / gosize,
			totalfree 			= free + inactive,
			wired 				= pageswireddown * pagesize / gosize,
			active 				= totalMemoryOsx - ( totalfree + wired );

			totalused 			= (active + wired)/totalMemoryOsx*100;
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

		document.getElementById("loading-ram").innerHTML = "Loading RAM Monitor...";

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
					document.getElementById("loading-ram").innerHTML = "RAM Monitor Loaded";
					loaded[1] = 1;
		  		}
			}, refresh);
		} else {
			// Mac OSX
			memDisplayInterval = setInterval(function() {
				// Get memory and wait for the variable (350ms)
				getMemoryAmountOSX();

				setTimeout(function() {
					// Get vm_stats infos and wait for the variables (350ms)
					getVmstatsInfosOSX();

					setTimeout(function() {
						var currentValueMem = Math.round(totalused);

						document.getElementById(textid).innerHTML = currentValueMem + "% MEMORY Usage.";
						memMonitorGui.StepColor(currentValueMem);

						if (ramMonitorLoaded==0) {
				  			ramMonitorLoaded = 1;

				  			// change loaded value from 0 to 1
				  			console.log("1 RAM Monitor Loaded");
							document.getElementById("loading-ram").innerHTML = "RAM Monitor Loaded";
							loaded[1] = 1;
				  		}
					}, 350);
					
				}, 350);
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