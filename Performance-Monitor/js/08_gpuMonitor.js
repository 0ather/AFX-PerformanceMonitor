/**
 * GPU monitoring (Windows only)
 *
 * The GPU is found once at start (systeminformation is slow: it runs several PowerShell commands).
 * Then the VRAM usage is read by one process that keeps running and prints a line at each refresh:
 ** NVIDIA: nvidia-smi in loop mode
 ** Other GPUs (or if nvidia-smi is missing): a PowerShell loop reading the Windows GPU counters
 *
 * @param {node} os from nodejs
 * @param {array} loaded array
 */
 var gpuMonitor = function(os, loaded) {
 	'use strict';

 	var spawn			= require('child_process').spawn,
 		gpuMonitorGui	= new GUI(loaded, "#gpu-container", "gpu", "step", 2),
 		NVIDIA_SMI		= ["nvidia-smi", "C:\\Program Files\\NVIDIA Corporation\\NVSMI\\nvidia-smi.exe"],
 		// Minimum interval for the Windows counters (each read asks WMI, a bit more expensive)
 		COUNTERS_MIN_INTERVAL = 1000,
 		gpuInfo			= null,
 		reader			= null,
 		// Incremented at each display/reset, so old callbacks know they are outdated
 		generation		= 0;

	/**
	 * Find the main GPU once - {nvidia: boolean, totalMB: number}
	 */
	function detectGPU(callback) {
		if (gpuInfo) return callback(gpuInfo);

		require('systeminformation').graphics().then(function(data) {
			var controllers	= data.controllers || [],
				target		= null;

			for (var i = 0; i < controllers.length; i++) {
				// clockCore is only reported for NVIDIA GPUs (dedicated)
				if (controllers[i].hasOwnProperty("clockCore")) {
					target = controllers[i];
					break;
				}
				// Otherwise, the one with the most memory (dedicated rather than integrated)
				if ( !target || (controllers[i].memoryTotal || 0) > (target.memoryTotal || 0) ) {
					target = controllers[i];
				}
			}

			gpuInfo = {
				nvidia: !!target && /nvidia/i.test(target.vendor + " " + target.model),
				totalMB: (target && target.memoryTotal) || 0
			};
			callback(gpuInfo);
		}).catch(function() {
			gpuInfo = { nvidia: false, totalMB: 0 };
			callback(gpuInfo);
		});
	}

	/**
	 * Call onLine for each line printed by a process
	 */
	function readLines(child, onLine) {
		var buffer = "";

		child.stdout.on('data', function(chunk) {
			var lines = (buffer + chunk).split(/\r?\n/);

			buffer = lines.pop();
			lines.forEach(function(line) {
				if (line.trim() !== "") onLine(line.trim());
			});
		});
	}

	/**
	 * NVIDIA: nvidia-smi prints "used, total" (in MB) every interval
	 * Falls back on the Windows counters if nvidia-smi can't be started
	 */
	function startNvidiaSmi(interval, onValue, pathIndex) {
		pathIndex = pathIndex || 0;

		if (pathIndex >= NVIDIA_SMI.length) {
			return startCounters(interval, onValue);
		}

		var child = spawn(NVIDIA_SMI[pathIndex], [
				"--query-gpu=memory.used,memory.total",
				"--format=csv,noheader,nounits",
				"-i", "0",
				"-lms", String(interval)
			], { windowsHide: true }),
			gotData = false;

		reader = child;

		readLines(child, function(line) {
			var values	= line.split(","),
				used	= parseFloat(values[0]),
				total	= parseFloat(values[1]);

			gotData = true;
			onValue( (total > 0 && !isNaN(used)) ? Math.round(used / total * 100) : null );
		});

		child.on('error', function() {
			// Not found at this path - try the next one
			if (reader === child) startNvidiaSmi(interval, onValue, pathIndex + 1);
		});

		child.on('exit', function() {
			if (reader !== child) return;	// stopped by us

			if (gotData) {
				onValue(null);
			} else {
				startNvidiaSmi(interval, onValue, pathIndex + 1);
			}
		});
	}

	/**
	 * Other GPUs: PowerShell loop reading the "GPU Adapter Memory" counters (Windows 10+)
	 * The WMI class name is the same on every Windows language (counter names are translated)
	 * The loop stops by itself if the panel process disappears
	 */
	function startCounters(interval, onValue) {
		var totalBytes	= gpuInfo.totalMB * 1024 * 1024,
			script		= [
				"$parent = " + require('process').pid,
				"while ($true) {",
				"  if (-not (Get-Process -Id $parent -ErrorAction SilentlyContinue)) { exit }",
				"  $used = (Get-CimInstance Win32_PerfFormattedData_GPUPerformanceCounters_GPUAdapterMemory -ErrorAction SilentlyContinue | Measure-Object -Property DedicatedUsage -Maximum).Maximum",
				"  if ($used -eq $null) { $used = 'none' }",
				"  [Console]::Out.WriteLine([string]$used)",
				"  [Console]::Out.Flush()",
				"  Start-Sleep -Milliseconds " + Math.max(interval, COUNTERS_MIN_INTERVAL),
				"}"
			].join("\n");

		if (!totalBytes) return onValue(null);

		var child = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script], { windowsHide: true });

		reader = child;

		readLines(child, function(line) {
			var used = parseFloat(line);

			onValue( isNaN(used) ? null : Math.min(100, Math.round(used / totalBytes * 100)) );
		});

		child.on('error', function() {
			if (reader === child) onValue(null);
		});
		child.on('exit', function() {
			if (reader === child) onValue(null);
		});
	}

	/**
	 * Stop the process reading the VRAM
	 */
	function stopReader() {
		var child = reader;

		reader = null;
		if (child) {
			try { child.kill(); } catch (e) {}
		}
	}

	// Don't leave the reading process running when the panel is closed
	window.addEventListener('beforeunload', stopReader);
	window.addEventListener('unload', stopReader);

	/**
     * Display
     *
     * @param {string} span id for the feedback text (percentage of use)
     * @param {number} refresh interval - default 2000
     */
	this.gpuDisplay = function(textid, refresh) {
		if ( os.type().indexOf("Windows") > -1 ) {
			// Windows
			var currentGeneration	= ++generation,
				lastText			= "";

			setLoadingText("loading-gpu", "Loading GPU Monitor...");

			gpuMonitorGui.addRow(1);
			gpuMonitorGui.StepSize();

			detectGPU(function() {
				// Display was reset while detecting the GPU
				if (currentGeneration !== generation) return;

				var onValue = function(VRAMcurrentValue) {
					var element = document.getElementById(textid),
						text	= (VRAMcurrentValue === null) ? "VRAM usage unavailable." : VRAMcurrentValue + "% VRAM Usage.";

					if (currentGeneration !== generation || !element) return;

					if (text !== lastText) {
						element.innerHTML = text;
						lastText = text;
					}
					if (VRAMcurrentValue !== null) gpuMonitorGui.StepColor(VRAMcurrentValue);
				};

				if (gpuInfo.nvidia) {
					startNvidiaSmi(refresh, onValue);
				} else {
					startCounters(refresh, onValue);
				}
			});

			// Don't wait for the GPU detection to show the panel
			console.log("2 GPU Monitor Loaded");
			setLoadingText("loading-gpu", "GPU Monitor Loaded");
			loaded[2] = 1;
		} else {
			// change loaded value from 0 to 1
		  	console.log("2 GPU Monitor Loaded");
			loaded[2] = 1;
		}
	}

	/**
	 * Reset the gpu display informations (to change the refresh interval)
	 */
	this.gpuResetDisplay = function() {
		generation++;
		stopReader();
    	gpuMonitorGui.removeRow();
    }
 }
