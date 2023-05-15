/**
 * GPU monitoring
 *
 * @param {node} os from nodejs
 * @param {array} loaded array
 */
 var gpuMonitor = function(os, loaded) {
 	'use strict';

 	var gpuDisplayInterval,
		GPUcontrollers,
		GPUtarget,
		totalVRAM,
		freeVRAM,
		dataFetched = 0;

    function getGPUinfo() {
    	dataFetched = 0;

    	var GPUinfo = require('systeminformation').graphics();

    	GPUinfo.then(data => {
	        // Once we've got the data save as variable
	        GPUcontrollers = data.controllers;

	        // If more than 1 GPU check if integrated or not
	        if (GPUcontrollers.length > 1) {
	        	for (var i=0; i < GPUcontrollers.length; i++) {
	        		if (GPUcontrollers[i].hasOwnProperty("clockCore")) {
	        			GPUtarget = GPUcontrollers[i];
	        		}
	        	}
	        } else {
	        	GPUtarget = GPUcontrollers[0];
	        }

	        dataFetched = 1;

	        totalVRAM = GPUtarget.memoryTotal;
	        freeVRAM = GPUtarget.memoryFree;
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
		gpuMonitorGui.addRow(1);

		gpuMonitorGui.StepSize();
		window.addEventListener('resize', function() { gpuMonitorGui.StepSize(); });

		if ( os.type().indexOf("Windows") > -1 ) {
			// Windows
			gpuDisplayInterval = setInterval(function() {
				getGPUinfo();

				var checkDataInterval = setInterval(function() {
					if (dataFetched != 0) {
						dataFetched = 0;
						var VRAMcurrentValue = 100 - ( Math.floor( freeVRAM / totalVRAM *100 ) );

						document.getElementById(textid).innerHTML = VRAMcurrentValue + "% VRAM Usage.";
						gpuMonitorGui.StepColor(VRAMcurrentValue);
					}
				}, (refresh/2));
			}, refresh);

			// change loaded value from 0 to 1
			setTimeout(function() {
				loaded[2] = 1;
			}, refresh);
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