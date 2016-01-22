/**
 * GUI
 * 
 * @param {string} gui container - cpu-container, memory-container
 * @param {string} gui group - cpu, memory
 * @param {string} gui steps
 * @param {number} space between steps
 * 
 */
 var GUI = function(loaded, container, groupname, stepsname, spacesteps) {
 	'use strict';

 	var _loaded		= loaded,
 		_container	= container,
 		_groupname 	= groupname,
 		_stepsname	= stepsname,
 		_spacesteps	= spacesteps;

 	_loaded.push(0);

 	/**
 	 * Add ROW and steps
 	 *
 	 * @param {number} number of row to build
 	 */
 	this.addRow = function(quantity) {
 	 	for ( var i = 1; i < quantity+1; i++ ) {
 	 		// Add span for percentage monitoring inside container - <span id="cpu / memory-monitoring- i"></span>
 	 		$(_container).append('<span id="'+_groupname+'-monitoring-'+i+'">Loading...</span>');
 	 		// Add cpu/memory element - <cpu / memory></cpu / memory> 
 	 		$(_container).append('<'+_groupname+' id="'+_groupname+i+'"></'+_groupname+'>');

 	 		// Add step element (bars) - <step class="step-disabled"></step>
 	 		for ( var j = 0; j < 20; j++ ) {
				$('#'+_groupname+i).append('<step class="step-disabled"></step>');
			}
 	 	}
 	}

 	/**
 	 * Add simple row (for cache)
 	 */
 	this.addSimpleRow = function() {
 		// Add span for percentage monitoring inside container - <span id="cpu / memory-monitoring- i"></span>
 		$(_container).append('<span id="'+_groupname+'-monitoring-1">Loading...</span>');
 		// Add cpu/memory element - <cpu / memory></cpu / memory> 
 		$(_container).append('<'+_groupname+' id="'+_groupname+'1"></'+_groupname+'>');
 		$(_container).append('<'+_groupname+' id="'+_groupname+'2" style="width:0%"></'+_groupname+'>');
 	}

 	/**
 	 * Remove ROW and steps
 	 */
 	this.removeRow = function() {
 		$(_container).empty();
 	}

 	/**
 	 * Add button (for cache)
 	 */
 	this.addButton = function(quantity) {
 		for ( var i = 1; i < quantity+1; i++ ) {
 	 		$(_container).append('<button id="'+_groupname+'-button-'+i+'" class="classic-button">Purge all memory & cache disk</button>');
 		}
 	}

 	/**
	 * GUI step bars size
	 * 
	 * @param {number} number of cpus in computer
	 */
	this.StepSize = function(numberCPUS) {
		if ( numberCPUS == undefined ) {
			var graphWidth 				= document.getElementsByTagName(_groupname)[0].offsetWidth,
				numberSteps 			= document.getElementsByTagName(_groupname)[0].getElementsByTagName(_stepsname).length,
				tempStepsWidth			= graphWidth / numberSteps,
				tempFullSpaceSteps		= _spacesteps * (numberSteps - 1),
				tempStepsSizeCorrection	= tempFullSpaceSteps / numberSteps,
				stepsWidth				= tempStepsWidth - tempStepsSizeCorrection;

			for (var i = 0; i < numberSteps; i++) {
				document.getElementsByTagName(_groupname)[0].getElementsByTagName(_stepsname)[i].style.width = stepsWidth +"px";
			}
		} else {
			for (var i = 0; i < numberCPUS; i++) {
				var graphWidth 				= document.getElementsByTagName(_groupname)[i].offsetWidth,
					numberSteps 			= document.getElementsByTagName(_groupname)[i].getElementsByTagName(_stepsname).length,
					tempStepsWidth			= graphWidth / numberSteps,
					tempFullSpaceSteps		= _spacesteps * (numberSteps - 1),
					tempStepsSizeCorrection	= tempFullSpaceSteps / numberSteps,
					stepsWidth				= tempStepsWidth - tempStepsSizeCorrection;

				for (var j = 0; j < numberSteps; j++) {
					document.getElementsByTagName(_groupname)[i].getElementsByTagName(_stepsname)[j].style.width = stepsWidth +"px";
				}
			}
		}
	}

	/**
	 * GUI step bars color
	 * 
	 * @param {number} usage of cpu(s) in percent
	 * @param {number} value of loop for multiple cpus display
	 */
	this.StepColor = function(percentageCPU, j) {
		if ( j == undefined ) {
			var numberSteps = document.getElementsByTagName(_groupname)[0].getElementsByTagName(_stepsname).length,
				percentPerStep = 100 / numberSteps;

			for ( var i = 1; i < numberSteps+1; i++ ) {

				if ( percentageCPU < (percentPerStep * i) ) {
					$(_groupname+" "+_stepsname+":nth-child("+i+")").removeClass("step-enabled").addClass("step-disabled");
				} else {
					$(_groupname+" "+_stepsname+":nth-child("+i+")").removeClass("step-disabled").addClass("step-enabled");
				}
			}
		} else {
			var numberSteps = document.getElementsByTagName(_groupname)[j-1].getElementsByTagName(_stepsname).length,
				percentPerStep = 100 / numberSteps;

			for ( var i = 1; i < numberSteps+1; i++ ) {

				if ( percentageCPU < (percentPerStep * i) ) {
					$('#'+_groupname+j+" "+_stepsname+":nth-child("+i+")").removeClass("step-enabled").addClass("step-disabled");
				} else {
					$('#'+_groupname+j+" "+_stepsname+":nth-child("+i+")").removeClass("step-disabled").addClass("step-enabled");
				}
			}
		}
	}

	/**
	 * GUI step simple color
	 * 
	 * @param {number} usage of cpu(s) in percent
	 */
	this.StepSimpleColor = function(percentage) {
		var barForeground = document.getElementsByTagName(_groupname)[1];

		barForeground.style.width = percentage+"%";
	}
 }