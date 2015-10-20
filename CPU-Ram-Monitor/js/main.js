/**
 * TODO
 */

 (function () {
    'use strict';

    var loaded          = [],
        loadedSum,
        settings        = getLocalStorage(),
        os              = require("os"),
        fs              = require("fs"),
        cpu             = new cpuMonitor(os, loaded),
        mem             = new memMonitor(os, loaded),
        diskCache       = new diskCacheMonitor(fs, loaded),
        advSettings     = new advancedSettings(settings, cpu, mem, diskCache);

    function showPanel() {
        document.getElementById("loading").remove();
        document.getElementById("content").style.opacity = 1;
    }

    function sumLoadVal() {
        // Reset sum
        loadedSum = 0;
        // Addition of array values
        for (var num in loaded) {
            loadedSum += loaded[num];
        }
    }

    function checkLoad() {
        sumLoadVal();

        var checkLoadInterval = setInterval(function() {
            if (loadedSum < loaded.length) {
                sumLoadVal();
            } else {
                showPanel();
                clearInterval(checkLoadInterval);
            }
        }, settings.refreshSettingMs);
    }

    function init() {
        if (navigator.onLine === true) checkUpdates();

        themeManager.init();
        advSettings.init();
        cpu.cpuDisplay(settings.coresSetting, "cpu-monitoring", settings.refreshSettingMs);
        mem.memoryDisplay("memory-monitoring-1", settings.refreshSettingMs);

        if ( settings.diskCacheSetting == "checked" ) {
            // If disk cache setting checked, display the information
            diskCache.diskCacheDisplay("disk-cache-monitoring-1", settings.refreshSettingMs);
        } else {
            // Else, remove diskCache loaded value in array (don't need it)
            loaded.splice(2, 1);
        }

        checkLoad();
    }
        
    init();
}());