/**
 * Write a message on the loading screen (does nothing once the panel is loaded)
 *
 * @param {string} id of the loading span - loading-cpu, loading-ram, loading-gpu, loading-cache
 * @param {string} message
 */
function setLoadingText(id, text) {
	'use strict';

	var element = document.getElementById(id);

	if (element != null) element.innerHTML = text;
}

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
 		_spacesteps	= spacesteps,
 		_self		= this,
 		// Step elements of each bar, found once when the bar is built - _bars[bar][step]
 		_bars		= [],
 		// Number of enabled steps of each bar, to only update what changed
 		_enabled	= [];

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
 	 		var bar = document.getElementById(_groupname+i),
 	 			steps = [];

 	 		for ( var j = 0; j < 20; j++ ) {
				var step = document.createElement(_stepsname);

				step.className = "step-disabled";
				bar.appendChild(step);
				steps.push(step);
			}

			_bars.push(steps);
			_enabled.push(0);
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
 		_bars		= [];
 		_enabled	= [];
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
	 * GUI step bars size - resize the steps of every bar to fill the bar width
	 */
	this.StepSize = function() {
		for (var i = 0; i < _bars.length; i++) {
			var steps		= _bars[i],
				graphWidth	= steps[0].parentNode.offsetWidth,
				stepsWidth	= ( graphWidth - _spacesteps * (steps.length - 1) ) / steps.length;

			for (var j = 0; j < steps.length; j++) {
				steps[j].style.width = stepsWidth + "px";
			}
		}
	}

	// One resize listener for all the bars of this group
	window.addEventListener('resize', function() { _self.StepSize(); });

	/**
	 * GUI step bars color - only the steps that changed are updated
	 * 
	 * @param {number} usage in percent
	 * @param {number} bar number, from 1 (default 1)
	 */
	this.StepColor = function(percentage, j) {
		var index	= (j == undefined) ? 0 : j-1,
			steps	= _bars[index];

		if (!steps || isNaN(percentage)) return;

		var percentPerStep	= 100 / steps.length,
			// Step i (from 1) is enabled if percentage >= percentPerStep * i
			enabled			= Math.max(0, Math.min(steps.length, Math.floor(percentage / percentPerStep))),
			previous		= _enabled[index],
			k;

		if (enabled > previous) {
			for (k = previous; k < enabled; k++) steps[k].className = "step-enabled";
		} else {
			for (k = enabled; k < previous; k++) steps[k].className = "step-disabled";
		}

		_enabled[index] = enabled;
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
