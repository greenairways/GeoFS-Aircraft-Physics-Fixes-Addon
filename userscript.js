// ==UserScript==
// @name         GeoFS Aircraft Physics Fixes
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Fixes the flaps of GeoFS Aircraft to work every time
// @author       thegreen121
// @match        https://*.geo-fs.com/geofs.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // CONFIGURATION - Adjust these to your liking
    const SETTINGS = {
        cleanLift: 10,          // Lift at 0 flaps (Raised for level flight)
        cleanIncidence: 6,      // Tilted wing to lower the nose at cruise
        fullFlapLift: 45,       // Massive lift at full flaps
        fullFlapIncidence: 20,  // Extreme wing tilt at full flaps
        pitchMoment: -0.25      // How much the nose "balloons" up
    };

    function applyPhysics() {
        // Ensure the aircraft and airfoils exist before running
        if (window.geofs && geofs.aircraft && geofs.aircraft.instance && geofs.aircraft.instance.airfoils) {

            // Get current flap value from GeoFS (usually 0 to 1)
            let fVal = geofs.animation.values.flaps || 0;

            geofs.aircraft.instance.airfoils.forEach(a => {
                // Targeting the physics wings confirmed in your console log
                if (a.name === "leftwing" || a.name === "rightwing") {

                    // Linear interpolation (Lerp) logic
                    a.liftFactor = SETTINGS.cleanLift + (fVal * (SETTINGS.fullFlapLift - SETTINGS.cleanLift));
                    a.angleIncidence = SETTINGS.cleanIncidence + (fVal * (SETTINGS.fullFlapIncidence - SETTINGS.cleanIncidence));

                    // Apply pitch effect
                    a.pitchMoment = fVal * SETTINGS.pitchMoment;

                    // Prevent stalling at high pitch angles
                    a.stallIncidence = 35;
                    a.zeroLiftIncidence = -6;
                }
            });
        }
    }

    // Run the loop every 20ms (50 times per second)
    setInterval(applyPhysics, 20);

    console.log("GeoFS Physics Patch Loaded: Aggressive Mode");
})();
