// ==UserScript==
// @name         GeoFS Modified Aircraft Physics
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Apply custom physics to aircraft 4631 and set wings for aircraft 24
// @author       You
// @match        *://www.geo-fs.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration for aircraft
    const customAircraft = {
        4631: { // Aircraft with modified physics
            mass: 100000,
            thrustFactor: 0.85,
            liftFactor: 0.9,
            dragFactor: 1.05
        },
        24: { // Aircraft where we just set wings
            parts: {
                wingLeft: 200,
                wingRight: 200
            }
        }
    };

    const applied = new Set(); // keeps track of which aircraft have been modified

    function applyChanges(ac) {
        if (!ac) return;
        if (applied.has(ac.id)) return; // already applied

        const cfg = customAircraft[ac.id];
        if (!cfg) return;

        // Apply physics if defined
        if (cfg.mass && ac.rigidBody) {
            ac.rigidBody.mass = cfg.mass;
            ac.rigidBody.s_inverseMass = 1 / cfg.mass;

            if (ac.engines) {
                ac.engines.forEach(engine => {
                    engine.maxThrust *= cfg.thrustFactor;
                });
            }

            if (ac.airfoils) {
                ac.airfoils.forEach(airfoil => {
                    airfoil.liftCoef *= cfg.liftFactor;
                    airfoil.dragCoef *= cfg.dragFactor;
                });
            }

            ac.rigidBody.v_linearVelocity = [0,0,0];
            ac.rigidBody.v_angularVelocity = [0,0,0];
        }

        // Apply parts if defined
        if (cfg.parts && ac.parts) {
            for (let partName in cfg.parts) {
                if (ac.parts[partName] !== undefined) {
                    ac.parts[partName] = cfg.parts[partName];
                    console.log(`Set ${partName} to ${cfg.parts[partName]} for aircraft ID ${ac.id}`);
                }
            }
        }

        applied.add(ac.id);
        console.log(`Custom changes applied to aircraft ID ${ac.id}`);
    }

    // Interval to check for aircraft spawn
    const checkInterval = setInterval(() => {
        if (typeof geofs !== 'undefined' && geofs.aircraft && geofs.aircraft.instance) {
            const ac = geofs.aircraft.instance;
            if (customAircraft[ac.id]) {
                applyChanges(ac);
            }
        }
    }, 500);

})();
