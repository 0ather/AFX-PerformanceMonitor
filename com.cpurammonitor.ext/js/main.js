(function () {
    'use strict';

    var cpu             = new cpuMonitor(),
        mem             = new memMonitor();
    
    function init() {
        themeManager.init();
        checkUpdates();
        cpu.cpuDisplay("one-core", "cpu-monitoring", 1000);
        mem.memoryDisplay("memory-monitoring-1", 1000);
    }
        
    init();
}());