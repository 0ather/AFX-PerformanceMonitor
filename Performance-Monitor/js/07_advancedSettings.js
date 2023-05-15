/**
 * Advanced settings panel
 *
 * @param {object} settings object
 * @param {object} cpu object
 * @param {object} mem object
 * @param {object} diskCache object
 */
var advancedSettings = function(settings, cpu, mem, gpu, diskCache) {
	'use strict';

	var _settings 	= settings,
		_cpu		= cpu,
		_mem		= mem,
		_gpu 		= gpu,
		_diskCache	= diskCache;

	/**
	 * Core button event
	 *
	 * @param {object} button object
	 */
	function coreButton(_this) {
		$('cores button').not(_this).removeClass("button-enabled").addClass("button-disabled");
		$(_this).removeClass("button-disabled").addClass("button-enabled");

		localStorage.setItem("cores-setting", _this.id);

		// Refresh settings variable with updated local storage
		_settings = getLocalStorage();

		// Reset the cpu display
		_cpu.cpuResetDisplay();

		// Restart the cpu display (with the new core setting - one or multi)
		_cpu.cpuDisplay(_settings.coresSetting, "cpu-monitoring", _settings.refreshSettingMs);

		debugger;
	}

	/**
	 * Refresh button event
	 *
	 * @param {object} button object
	 * @param {object} cpu monitor
	 * @param {object} memory monitor
	 * @param {object} disk cache monitor
	 */
	function refreshButton (_this, _cpu, _mem, _gpu, _diskCache) {
		$('refresh button').not(_this).removeClass("button-enabled").addClass("button-disabled");
		$(_this).removeClass("button-disabled").addClass("button-enabled");

		localStorage.setItem("refresh-setting", _this.id);

		// Refresh settings variable with updated local storage
		_settings = getLocalStorage();

		// Reset the cpu and memory display
		_cpu.cpuResetDisplay();
		_mem.memoryResetDisplay();
		_gpu.gpuResetDisplay();

		// Restart the cpu and memory display (with the new interval refresh setting)
		_cpu.cpuDisplay(_settings.coresSetting, "cpu-monitoring", _settings.refreshSettingMs);
		_mem.memoryDisplay("memory-monitoring-1", _settings.refreshSettingMs);
		_gpu.gpuDisplay("gpu-monitoring-1", _settings.refreshSettingMs);
	}

	/**
	 * Show cache disk checkbox
	 * @param {object} checkbox object
	 */
	function showcacheCheckbox(_this) {
		if ( _this.checked == 1 ) {
			// Show
			localStorage.setItem("diskcache-setting", "checked");

			_diskCache.diskCacheDisplay("disk-cache-monitoring-1", _settings.refreshSettingMs);
		} else {
			// Hide
			localStorage.setItem("diskcache-setting", "unchecked");

			_diskCache.diskCacheUndisplay();
		}
	}

	/**
	 * Init
	 */
	this.init = function() {
		// Advanced settings button click
		$('#advanced-settings').click(function() {
			$('settings').toggleClass("active");
			$('body').toggleClass("active");
		});
		$('#advanced-settings .active').click(function() {
			$('body').scrollTop(0);
		});

		// Enable cores setting button (GUI only)
		$('settings cores #'+_settings.coresSetting).removeClass("button-disabled").addClass("button-enabled");

		// Enable refresh setting button (GUI onyl)
		$('settings refresh #'+_settings.refreshSetting).removeClass("button-disabled").addClass("button-enabled");

		// Enable disk cache setting checkbox (GUI onyl)
		$('settings showcache input').attr(_settings.diskCacheSetting, '');

		// Clicks on buttons
		$('.settings-button').click(function(e) {
			if ($('settings').css('opacity')==0) {
				// If invisible, lock the button
				e.preventDefault();
			} else {
				// Else, call the functions
			    switch(this.parentNode.localName) {
			        case "cores":
			            coreButton(this);
			            break;
			        case "refresh":
			            refreshButton(this, _cpu, _mem, _gpu, _diskCache);
			            break;
			        case "showcache":
			            showcacheCheckbox(this);
			            break;
			    }
			}
		});
	}
}