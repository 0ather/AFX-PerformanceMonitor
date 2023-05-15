/**
 * Local storage
 *
 * Content:
 ** "cores-setting"
 ** "refresh-setting"
 ** "diskcache-setting"
 */
function convertRefreshMs() {
	'use strict';

	// Convert refresh setting into ms
	switch(localStorage.getItem("refresh-setting")) {
		case "refresh-normal":
			return 2000;
		case "refresh-often":
			return 1000;
		case "refresh-veryoften":
			return 500;
	}
}

function getLocalStorage() {
	'use strict';

	if (localStorage.length == 3) {
		// Data in local storage
		return {
			coresSetting: localStorage.getItem("cores-setting"),
			refreshSetting: localStorage.getItem("refresh-setting"),
			refreshSettingMs: convertRefreshMs(),
			diskCacheSetting: localStorage.getItem("diskcache-setting")
		};
	} else {
		// No data in local storage - Default settings
		localStorage.setItem("cores-setting", "one-core");
		localStorage.setItem("refresh-setting", "refresh-normal");
		localStorage.setItem("diskcache-setting", "unchecked");

		return {
			coresSetting: "one-core",
			refreshSetting: "refresh-normal",
			refreshSettingMs: 2000,
			diskCacheSetting: "unchecked"
		};
	}
}