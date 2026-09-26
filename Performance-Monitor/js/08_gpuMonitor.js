/**
 * GPU monitoring
 *
 * @param {node} os from nodejs
 * @param {array} loaded array
 */
 var gpuMonitor = function(os, loaded) {
 	'use strict';

 	var gpuDisplayInterval,
		requestInProgress = false;

	/**
	 * Get the VRAM usage of the main GPU, then send the percentage to the callback
	 * (null if the GPU doesn't report its free memory)
	 */
	function getGPUinfo(callback) {
		require('systeminformation').graphics().then(function(data) {
			var GPUcontrollers	= data.controllers,
				GPUtarget		= GPUcontrollers[0];

			// If more than 1 GPU, take the dedicated one (not integrated)
			for (var i=0; i < GPUcontrollers.length; i++) {
				if (GPUcontrollers[i].hasOwnProperty("clockCore")) {
					GPUtarget = GPUcontrollers[i];
				}
			}

			if ( !GPUtarget || !GPUtarget.memoryTotal || GPUtarget.memoryFree == undefined ) {
				callback(null);
			} else {
				callback(100 - Math.floor( GPUtarget.memoryFree / GPUtarget.memoryTotal * 100 ));
			}
		}).catch(function() {
			callback(null);
		});
	}

	var gpuMonitorGui = new GUI(loaded, "#gpu-container", "gpu", "step", 2);


	/**
     * Display
     *
     * @param {string} span id for the feedback text (percentage of use)
     * @param {number} refresh interval - default 2000
     */
	this.gpuDisplay = function(textid, refresh) {
		if ( os.type().indexOf("Windows") > -1 ) {
			// Windows
			var gpuMonitorLoaded = 0;

			setLoadingText("loading-gpu", "Loading GPU Monitor...");

			gpuMonitorGui.addRow(1);

			gpuMonitorGui.StepSize();
			window.addEventListener('resize', function() { gpuMonitorGui.StepSize(); });

			gpuDisplayInterval = setInterval(function() {
				// Skip this tick if the previous request is still running
				if (requestInProgress) return;
				requestInProgress = true;

				getGPUinfo(function(VRAMcurrentValue) {
					requestInProgress = false;

					// Display may have been reset while waiting
					if (!document.getElementById(textid)) return;

					if (VRAMcurrentValue === null) {
						document.getElementById(textid).innerHTML = "VRAM usage unavailable.";
					} else {
						document.getElementById(textid).innerHTML = VRAMcurrentValue + "% VRAM Usage.";
						gpuMonitorGui.StepColor(VRAMcurrentValue);
					}

					if (gpuMonitorLoaded==0) {
						gpuMonitorLoaded = 1;

						// change loaded value from 0 to 1
						console.log("2 GPU Monitor Loaded");
						setLoadingText("loading-gpu", "GPU Monitor Loaded");
						loaded[2] = 1;
					}
				});
			}, refresh);
		} else {
			// change loaded value from 0 to 1
		  	console.log("2 GPU Monitor Loaded");
			loaded[2] = 1;
		}
	}

	/**
	 * Reset the memory display informations (to change the refresh interval)
	 */
	this.gpuResetDisplay = function() {
    	gpuMonitorGui.removeRow();
    	clearInterval(gpuDisplayInterval);
    }
 }