/**
 * CPU monitoring
 *
 * @param {node} os from nodejs
 * @param {array} loaded array
 */
var cpuMonitor = function(os, loaded) {
	'use strict';

	var cpuMonitorGui	= new GUI(loaded, "#cpu-container", "cpu", "step", 2),
		cpuDisplayInterval;

    /**
     * CPU Average for all cores
     */
	function cpuAverage() {
		//Initialise sum of idle and time of cores and fetch CPU info
		var cpus 		= os.cpus(),
			totalIdle 	= 0,
			totalTick 	= 0,
			type;

		for(var i = 0, len = cpus.length; i < len; i++) {
		    var cpu = cpus[i];

		    //Total up the time in the cores tick
		    for(type in cpu.times) {
		      totalTick += cpu.times[type];
		   	}     

		    //Total up the idle time of the core
		    totalIdle += cpu.times.idle;
	  	}

  		return {
  			idle: totalIdle / cpus.length,
  			total: totalTick / cpus.length
  		};
	}

    /**
     * CPU Average for multi cores
     */
	function cpuMultiAverage() {
	    var cpus       = os.cpus(),
	        cpusIdle   = [],
	        cpusTick   = [],
	        type;

	    for ( var i = 0; i < cpus.length; i++ ) {
	        var tempResult = 0;

	        for (type in cpus[i].times) {
	            tempResult += cpus[i].times[type];
	        }

	        cpusIdle[i] = cpus[i].times.idle;
	        cpusTick[i] = tempResult;
	    }

	    return {
	        cpusNumber: cpus.length,
	        cpusIdle: cpusIdle,
	        cpusTick: cpusTick
	    };
	}

	/**
     * Display
     *
     * @param {string} type of display - one-core or multi-core
     * @param {string} span id for the feedback text (percentage of use)
     * @param {number} refresh interval - default 2000
     */
	this.cpuDisplay = function(type, textid, refresh) {
		document.getElementById("loading-cpu").innerHTML = "Loading CPU Monitor...";

		if (type == "one-core") {
			var cpuMonitorLoaded = 0,
				percentageCPU = 0,
				startMeasure = cpuAverage();

			cpuMonitorGui.addRow(1);

			cpuMonitorGui.StepSize();

			window.addEventListener('resize', function() { cpuMonitorGui.StepSize(); });

	        cpuDisplayInterval = setInterval(function() {
	            var endMeasure = cpuAverage();

	            //Calculate the difference in idle and total time between the measures
	            var idleDifference = endMeasure.idle - startMeasure.idle;
	            var totalDifference = endMeasure.total - startMeasure.total;

	            //Calculate the average percentage CPU usage
	            percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

				document.getElementById(textid+"-1").innerHTML = percentageCPU + "% CPU Usage.";
		  		cpuMonitorGui.StepColor(percentageCPU);

		  		startMeasure = endMeasure;

		  		if (cpuMonitorLoaded==0) {
		  			cpuMonitorLoaded = 1;

		  			// change loaded value from 0 to 1
		  			console.log("0 CPU Monitor Loaded");
					document.getElementById("loading-cpu").innerHTML = "CPU Monitor Loaded";
					loaded[0] = 1;
		  		}
			}, refresh);
	    } else {
	        var idleDifference = [];
	        var totalDifference = [];
	        var percentageCPUS = [];

	        var startMeasure = cpuMultiAverage();

	        cpuMonitorGui.addRow(startMeasure.cpusNumber);

			cpuMonitorGui.StepSize(startMeasure.cpusNumber);

			window.addEventListener('resize', function() { cpuMonitorGui.StepSize(startMeasure.cpusNumber); });

	        cpuDisplayInterval = setInterval(function() {
	            var endMeasure = cpuMultiAverage();

	            for ( var j = 0; j < startMeasure.cpusNumber; j++ ) {
	                idleDifference[j] = endMeasure.cpusIdle[j] - startMeasure.cpusIdle[j];
	                totalDifference[j] = endMeasure.cpusTick[j] - startMeasure.cpusTick[j];

	                percentageCPUS[j] = 100 - ~~(100 * idleDifference[j] / totalDifference[j]);

	                document.getElementById(textid+"-"+(j+1)).innerHTML = percentageCPUS[j] + "% CPU Usage.";
	                cpuMonitorGui.StepColor(percentageCPUS[j], (j+1));
	            }

	            startMeasure = endMeasure;

	            if (cpuMonitorLoaded==0) {
		  			cpuMonitorLoaded = 1;

		  			// change loaded value from 0 to 1
		  			console.log("0 CPU Monitor Loaded");
					document.getElementById("loading-cpu").innerHTML = "CPU Monitor Loaded";
					loaded[0] = 1;
		  		}
	        }, refresh);
	    }
	}

	/**
	 * Reset the cpu display informations (to change the refresh interval)
	 */
	this.cpuResetDisplay = function() {
    	cpuMonitorGui.removeRow();
    	clearInterval(cpuDisplayInterval);
    }
}