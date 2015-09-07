/**
 * MEMORY MONITORING
 */
 var memMonitor = function() {
 	'use strict';

	var os 				= require("os"),
		child_process 	= require('child_process'),
		execFile 		= require('child_process').execFile;

	// Windows
	var totalMemoryWin 	= os.totalmem(),
		MemMonitorGui 	= new GUI("#memory-container", "memory", "step", 2);

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
			
			// console.log(stdout);

			free 				= ( pagesfree + pagesspeculative ) * pagesize / gosize,
			inactive 			= pagesinactive * pagesize / gosize,
			totalfree 			= free + inactive,
			wired 				= pageswireddown * pagesize / gosize,
			active 				= totalMemoryOsx - ( totalfree + wired );

			totalused 			= (active + wired)/16*100;
		});
	}

	/**
     * Display
     *
     * @param {string} span id for the feedback text (percentage of use)
     * @param {number} refresh interval - default 1000
     */
	this.memoryDisplay = function(textid, refresh) {
		MemMonitorGui.addRow(1);

		MemMonitorGui.StepSize();
		window.addEventListener('resize', function() { MemMonitorGui.StepSize(); });

		// If windows
		if ( os.type().indexOf("Windows") > -1 ) {
			setInterval(function() {
				var currentValueMem = 100 - memoryUtilisationWIN();

				document.getElementById(textid).innerHTML = currentValueMem + "% MEMORY Usage.";
				MemMonitorGui.StepColor(currentValueMem);
			}, refresh);
		} else {
			setInterval(function() {
				// Get memory and wait for the variable (350ms)
				getMemoryAmountOSX();

				setTimeout(function() {
					// Get vm_stats infos and wait for the variables (350ms)
					getVmstatsInfosOSX();

					setTimeout(function() {
						var currentValueMem = Math.round(totalused);

						document.getElementById(textid).innerHTML = currentValueMem + "% MEMORY Usage.";
						MemMonitorGui.StepColor(currentValueMem);
					}, 350);
					
				}, 350);
			}, refresh);
		}
	}
 }