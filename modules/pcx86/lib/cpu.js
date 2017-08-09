/**
 * @fileoverview Implements the PCx86 CPU component.
 * @author <a href="mailto:Jeff@pcjs.org">Jeff Parsons</a>
 * @copyright © Jeff Parsons 2012-2017
 *
 * This file is part of PCjs, a computer emulation software project at <http://pcjs.org/>.
 *
 * PCjs is free software: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * PCjs is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with PCjs.  If not,
 * see <http://www.gnu.org/licenses/gpl.html>.
 *
 * You are required to include the above copyright notice in every modified copy of this work
 * and to display that copyright notice when the software starts running; see COPYRIGHT in
 * <http://pcjs.org/modules/shared/lib/defines.js>.
 *
 * Some PCjs files also attempt to load external resource files, such as character-image files,
 * ROM files, and disk image files. Those external resource files are not considered part of PCjs
 * for purposes of the GNU General Public License, and the author does not claim any copyright
 * as to their contents.
 */

"use strict";

if (NODE) {
    var Str         = require("../../shared/lib/strlib");
    var Usr         = require("../../shared/lib/usrlib");
    var Component   = require("../../shared/lib/component");
    var Messages    = require("./messages");
}

/**
 * TODO: The Closure Compiler treats ES6 classes as 'struct' rather than 'dict' by default,
 * which would force us to declare all class properties in the constructor, as well as prevent
 * us from defining any named properties.  So, for now, we mark all our classes as 'unrestricted'.
 *
 * @unrestricted
 */
class CPU extends Component {
    /**
     * CPU(parmsCPU, nCyclesDefault)
     *
     * The CPU class supports the following (parmsCPU) properties:
     *
     *      cycles: the machine's base cycles per second; the X86CPU constructor will provide us with a default
     *      (based on the CPU model) to use as a fallback.
     *
     *      multiplier: base cycle multiplier; default is 1.
     *
     *      autoStart: true to automatically start, false to not, or null if "it depends"; null is the default,
     *      which means do not autostart UNLESS there is no Debugger and no "Run" button (ie, no way to manually
     *      start the machine).
     *
     *      csStart: the number of cycles that runCPU() must wait before generating checksum records;
     *      -1 if disabled.  checksum records are a diagnostic aid used to help compare one CPU run to another.
     *
     *      csInterval: the number of cycles that runCPU() must execute before generating a checksum record;
     *      -1 if disabled.
     *
     *      csStop: the number of cycles to stop generating checksum records.
     *
     * This component is primarily responsible for interfacing the CPU with the outside world (eg, Panel and Debugger
     * components), and managing overall CPU operation.
     *
     * It is extended by the X86CPU component, where all the x86-specific logic resides.
     *
     * @this {CPU}
     * @param {Object} parmsCPU
     * @param {number} nCyclesDefault
     */
    constructor(parmsCPU, nCyclesDefault)
    {
        super("CPU", parmsCPU, Messages.CPU);

        var nCycles = parmsCPU['cycles'] || nCyclesDefault;

        var nMultiplier = parmsCPU['multiplier'] || 1;

        this.counts = {};
        this.counts.nBaseCyclesPerSecond = nCycles;

        /*
         * nTargetMultiplier replaces the old "speed" variable (0, 1, 2) and eliminates the need for
         * the constants (SPEED_SLOW, SPEED_FAST and SPEED_MAX).  The UI simply doubles the target multiplier
         * until we've exceeded the host's speed limit (ie, the current value is unable to reach the target),
         * at which point we reset the target back to the default.
         */
        this.counts.nBaseMultiplier = this.counts.nCurrentMultiplier = this.counts.nTargetMultiplier = nMultiplier;

        this.counts.mhzBase = Math.round(this.counts.nBaseCyclesPerSecond / 10000) / 100;
        this.counts.mhzCurrent = this.counts.mhzTarget = this.counts.mhzBase * this.counts.nTargetMultiplier;

        /*
         * We add a number of flags to those initialized by Component.
         */
        this.flags.starting = this.flags.running = this.flags.yield = false;
        this.flags.autoStart = parmsCPU['autoStart'];

        /*
         * TODO: Add some UI for displayLiveRegs (either an XML property, or a UI checkbox, or both)
         */
        this.flags.displayLiveRegs = false;

        /*
         * Get checksum parameters, if any. runCPU() behavior is not affected until fChecksum
         * is true, which won't happen until resetChecksum() is called with nCyclesChecksumInterval
         * ("csInterval") set to a positive value.
         *
         * As above, any of these parameters can also be set with the Debugger's execution options
         * command ("x"); for example, "x cs int 5000" will set nCyclesChecksumInterval to 5000
         * and call resetChecksum().
         */
        this.flags.checksum = false;
        this.counts.nChecksum = this.counts.nCyclesChecksumNext = 0;
        this.counts.nCyclesChecksumStart = parmsCPU["csStart"];
        this.counts.nCyclesChecksumInterval = parmsCPU["csInterval"];
        this.counts.nCyclesChecksumStop = parmsCPU["csStop"];

        /*
         * Array of countdown timers managed by addTimer() and setTimer().
         *
         * See also: getMSCycles(), getBurstCycles(), saveTimers(), restoreTimers(), and updateTimers()
         */
        this.aTimers = [];

        this.onRunTimeout = this.runCPU.bind(this); // function onRunTimeout() { cpu.runCPU(); };
    }

    /**
     * initBus(cmp, bus, cpu, dbg)
     *
     * @this {CPU}
     * @param {Computer} cmp
     * @param {Bus} bus
     * @param {CPU} cpu
     * @param {DebuggerX86} dbg
     */
    initBus(cmp, bus, cpu, dbg)
    {
        this.cmp = cmp;
        this.bus = bus;
        this.dbg = dbg;

        for (var i = 0; i < CPU.BUTTONS.length; i++) {
            var control = this.bindings[CPU.BUTTONS[i]];
            if (control) this.cmp.setBinding(null, CPU.BUTTONS[i], control);
        }

        this.fpu = cmp.getMachineComponent("FPU");

        /*
         * Attach the ChipSet component to the CPU so that it can obtain the IDT vector number
         * of pending hardware interrupts in response to the ChipSet's updateINTR() notifications.
         *
         * We must also call chipset.updateAllTimers() periodically; stepCPU() takes care of that.
         */
        this.chipset = cmp.getMachineComponent("ChipSet");

        /*
         * We've already saved the parmsCPU 'autoStart' setting, but there may be a machine (or URL) override.
         */
        var sAutoStart = cmp.getMachineParm('autoStart');
        if (sAutoStart != null) {
            this.flags.autoStart = (sAutoStart == "true"? true : (sAutoStart  == "false"? false : !!sAutoStart));
        }

        this.timerYield = cpu.addTimer(this.id, function() {
            cpu.flags.yield = true;
        }, 1000 / CPU.YIELDS_PER_SECOND);

        this.setReady();
    }

    /**
     * reset()
     *
     * This is a placeholder for reset (overridden by the X86CPU component).
     *
     * @this {CPU}
     */
    reset()
    {
    }

    /**
     * save(fRunning)
     *
     * This is a placeholder for save support (overridden by the X86CPU component).
     *
     * @this {CPU}
     * @param {boolean} [fRunning]
     * @return {Object|null}
     */
    save(fRunning)
    {
        return null;
    }

    /**
     * restore(data)
     *
     * This is a placeholder for restore support (overridden by the X86CPU component).
     *
     * @this {CPU}
     * @param {Object} data
     * @return {boolean} true if restore successful, false if not
     */
    restore(data)
    {
        return false;
    }

    /**
     * powerUp(data, fRepower)
     *
     * @this {CPU}
     * @param {Object|null} data
     * @param {boolean} [fRepower]
     * @return {boolean} true if successful, false if failure
     */
    powerUp(data, fRepower)
    {
        if (!fRepower) {
            if (!data || !this.restore) {
                this.reset();
            } else {
                this.resetCycles();
                if (!this.restore(data)) return false;
                this.resetChecksum();
            }
            /*
             * Give the Debugger a chance to do/print something once we've powered up
             */
            if (DEBUGGER && this.dbg) {
                this.dbg.init();
            } else {
                this.println("No debugger detected");
            }
        }
        /*
         * The Computer component (which is responsible for all powerDown and powerUp notifications)
         * is now responsible for managing a component's fPowered flag, not us.
         *
         *      this.flags.powered = true;
         */
        this.updateCPU();
        return true;
    }

    /**
     * powerDown(fSave, fShutdown)
     *
     * @this {CPU}
     * @param {boolean} [fSave]
     * @param {boolean} [fShutdown]
     * @return {Object|boolean} component state if fSave; otherwise, true if successful, false if failure
     */
    powerDown(fSave, fShutdown)
    {
        /*
         * The Computer component (which is responsible for all powerDown and powerUp notifications)
         * is now responsible for managing a component's fPowered flag, not us.
         *
         *      this.flags.powered = false;
         */
        var fRunning = this.flags.running;
        if (fShutdown) this.stopCPU();
        return fSave? this.save(fRunning) : true;
    }

    /**
     * autoStart()
     *
     * @this {CPU}
     * @return {boolean} true if started, false if not
     */
    autoStart()
    {
        if (this.flags.running) {
            return true;
        }
        /*
         * Start running automatically on power-up, assuming there's no Debugger and no "Run" button.
         */
        if (this.flags.autoStart || (!DEBUGGER || !this.dbg) && this.bindings["run"] === undefined) {
            /*
             * We used to also set fUpdateFocus when calling startCPU(), on the assumption that in the "auto-starting"
             * context, a machine without focus is like a day without sunshine, but in reality, focus should only be
             * forced when the user takes some other machine-related action.
             */
            return this.startCPU();
        }
        return false;
    }

    /**
     * isPowered()
     *
     * @this {CPU}
     * @return {boolean}
     */
    isPowered()
    {
        if (!this.flags.powered) {
            this.println(this.toString() + " not powered");
            return false;
        }
        return true;
    }

    /**
     * isRunning()
     *
     * @this {CPU}
     * @return {boolean}
     */
    isRunning()
    {
        return this.flags.running;
    }

    /**
     * getChecksum()
     *
     * This will be implemented by the X86CPU component.
     *
     * @this {CPU}
     * @return {number} a 32-bit summation of key elements of the current CPU state (used by the CPU checksum code)
     */
    getChecksum()
    {
        return 0;
    }

    /**
     * resetChecksum()
     *
     * If checksum generation is enabled (fChecksum is true), this resets the running 32-bit checksum and the
     * cycle counter that will trigger the next displayChecksum(); called by resetCycles(), which is called whenever
     * the CPU is reset or restored.
     *
     * @this {CPU}
     * @return {boolean} true if checksum generation enabled, false if not
     */
    resetChecksum()
    {
        if (this.counts.nCyclesChecksumStart === undefined) this.counts.nCyclesChecksumStart = 0;
        if (this.counts.nCyclesChecksumInterval === undefined) this.counts.nCyclesChecksumInterval = -1;
        if (this.counts.nCyclesChecksumStop === undefined) this.counts.nCyclesChecksumStop = -1;
        this.flags.checksum = (this.counts.nCyclesChecksumStart >= 0 && this.counts.nCyclesChecksumInterval > 0);
        if (this.flags.checksum) {
            this.counts.nChecksum = 0;
            this.counts.nCyclesChecksumNext = this.counts.nCyclesChecksumStart - this.nTotalCycles;
            /*
             *  this.counts.nCyclesChecksumNext = this.counts.nCyclesChecksumStart + this.counts.nCyclesChecksumInterval -
             *      (this.nTotalCycles % this.counts.nCyclesChecksumInterval);
             */
            return true;
        }
        return false;
    }

    /**
     * updateChecksum(nCycles)
     *
     * When checksum generation is enabled (fChecksum is true), runCPU() asks stepCPU() to execute a minimum
     * number of cycles (1), effectively limiting execution to a single instruction, and then we're called with
     * the exact number cycles that were actually executed.  This should give us instruction-granular checksums
     * at precise intervals that are 100% repeatable.
     *
     * @this {CPU}
     * @param {number} nCycles
     */
    updateChecksum(nCycles)
    {
        if (this.flags.checksum) {
            /*
             * Get a 32-bit summation of the current CPU state and add it to our running 32-bit checksum
             */
            var fDisplay = false;
            this.counts.nChecksum = (this.counts.nChecksum + this.getChecksum())|0;
            this.counts.nCyclesChecksumNext -= nCycles;
            if (this.counts.nCyclesChecksumNext <= 0) {
                this.counts.nCyclesChecksumNext += this.counts.nCyclesChecksumInterval;
                fDisplay = true;
            }
            if (this.counts.nCyclesChecksumStop >= 0) {
                if (this.counts.nCyclesChecksumStop <= this.getCycles()) {
                    this.counts.nCyclesChecksumInterval = this.counts.nCyclesChecksumStop = -1;
                    this.resetChecksum();
                    this.stopCPU();
                    fDisplay = true;
                }
            }
            if (fDisplay) this.displayChecksum();
        }
    }

    /**
     * displayChecksum()
     *
     * When checksum generation is enabled (fChecksum is true), this is called to provide a crude log of all
     * checksums generated at the specified cycle intervals, as specified by the "csStart" and "csInterval" parmsCPU
     * properties).
     *
     * @this {CPU}
     */
    displayChecksum()
    {
        this.println(this.getCycles() + " cycles: " + "checksum=" + Str.toHex(this.counts.nChecksum));
    }

    /**
     * displayValue(sLabel, nValue, cch)
     *
     * This is principally for displaying register values, but in reality, it can be used to display any
     * numeric (hex) value bound to the given label.
     *
     * @this {CPU}
     * @param {string} sLabel
     * @param {number} nValue
     * @param {number} cch
     */
    displayValue(sLabel, nValue, cch)
    {
        if (this.bindings[sLabel]) {
            if (nValue === undefined) {
                this.setError("Value for " + sLabel + " is invalid");
                this.stopCPU();
            }
            var sVal;
            if (!this.flags.running || this.flags.displayLiveRegs) {
                sVal = Str.toHex(nValue, cch);
            } else {
                sVal = "--------".substr(0, cch);
            }
            /*
             * TODO: Determine if this test actually avoids any redrawing when a register hasn't changed, and/or if
             * we should maintain our own (numeric) cache of displayed register values (to avoid creating these temporary
             * string values that will have to garbage-collected), and/or if this is actually slower, and/or if I'm being
             * too obsessive.
             */
            if (this.bindings[sLabel].textContent != sVal) this.bindings[sLabel].textContent = sVal;
        }
    }

    /**
     * setBinding(sHTMLType, sBinding, control, sValue)
     *
     * @this {CPU}
     * @param {string|null} sHTMLType is the type of the HTML control (eg, "button", "list", "text", "submit", "textarea", "canvas")
     * @param {string} sBinding is the value of the 'binding' parameter stored in the HTML control's "data-value" attribute (eg, "run")
     * @param {HTMLElement} control is the HTML control DOM object (eg, HTMLButtonElement)
     * @param {string} [sValue] optional data value
     * @return {boolean} true if binding was successful, false if unrecognized binding request
     */
    setBinding(sHTMLType, sBinding, control, sValue)
    {
        var cpu = this;
        var fBound = false;

        switch (sBinding) {
        case "power":
        case "reset":
            /*
             * The "power" and "reset" buttons are functions of the entire computer, not just the CPU,
             * but it's not always convenient to stick a power button in the Computer component definition,
             * so we record those bindings here and pass them on to the Computer component in initBus().
             */
            this.bindings[sBinding] = control;
            fBound = true;
            break;

        case "run":
            this.bindings[sBinding] = control;
            control.onclick = function onClickRun() {
                var fRunning = cpu.flags.running;
                if (!cpu.cmp || !cpu.cmp.checkPower()) return;
                /*
                 * We snapped the CPU's running flag before calling checkPower() because there are rare (REPOWER)
                 * situations where checkPower() will have started the CPU as well.  So toggle the CPU state ONLY
                 * if the running flag remains unchanged.
                 */
                if (fRunning == cpu.flags.running) {
                    if (!cpu.flags.running) {
                        cpu.startCPU(true);
                    } else {
                        cpu.stopCPU(true);
                    }
                }
            };
            fBound = true;
            break;

        case "speed":
            this.bindings[sBinding] = control;
            fBound = true;
            break;

        case "setSpeed":
            this.bindings[sBinding] = control;
            control.onclick = function onClickSetSpeed() {
                cpu.setSpeed(cpu.counts.nTargetMultiplier << 1, true);
            };
            control.textContent = this.getSpeedTarget();
            fBound = true;
            break;

        default:
            break;
        }
        return fBound;
    }

    /**
     * setBurstCycles(nCycles)
     *
     * This function is used by the ChipSet component whenever a very low timer count is set.
     *
     * @this {CPU}
     * @param {number} nCycles is the target number of cycles to drop the current burst to
     * @return {boolean}
     */
    setBurstCycles(nCycles)
    {
        if (this.flags.running) {
            var nDelta = this.nStepCycles - nCycles;
            /*
             * NOTE: If nDelta is negative, we will actually be increasing nStepCycles and nBurstCycles.
             * Which is OK, but if we're also taking snapshots of the cycle counts, to make sure that instruction
             * costs are being properly assessed, then we need to update nSnapCycles as well.
             *
             * TODO: If the delta is negative, we could simply ignore the request, but we must first carefully
             * consider the impact on the ChipSet timers.
             */
            this.nStepCycles -= nDelta;
            this.nBurstCycles -= nDelta;
            return true;
        }
        return false;
    }

    /**
     * addCycles(nCycles, fEndStep)
     *
     * @this {CPU}
     * @param {number} nCycles
     * @param {boolean} [fEndStep]
     */
    addCycles(nCycles, fEndStep)
    {
        this.nTotalCycles += nCycles;
        if (fEndStep) {
            this.nBurstCycles = this.nStepCycles = 0;
        }
    }

    /**
     * calcCycles()
     *
     * Calculate the maximum number of cycles we should attempt to process before the next yield.
     *
     * @this {CPU}
     */
    calcCycles()
    {
        var nMultiplier = this.counts.mhzCurrent / this.counts.mhzBase;
        if (!nMultiplier || nMultiplier > this.counts.nTargetMultiplier) {
            nMultiplier = this.counts.nTargetMultiplier;
        }
        this.counts.msPerYield = Math.round(1000 / CPU.YIELDS_PER_SECOND);
        this.counts.nCyclesPerYield = Math.floor(this.counts.nBaseCyclesPerSecond / CPU.YIELDS_PER_SECOND * nMultiplier);
        this.counts.nCurrentMultiplier = nMultiplier;
    }

    /**
     * getCycles(fScaled)
     *
     * getCycles() returns the number of cycles executed so far.  Note that we can be called after
     * runCPU() OR during runCPU(), perhaps from a handler triggered during the current run's stepCPU(),
     * so nRunCycles must always be adjusted by number of cycles stepCPU() was asked to run (nBurstCycles),
     * less the number of cycles it has yet to run (nStepCycles).
     *
     * nRunCycles is zeroed whenever the CPU is halted or the CPU speed is changed, which is why we also
     * have nTotalCycles, which accumulates all nRunCycles before we zero it.  However, nRunCycles and
     * nTotalCycles eventually get reset by calcSpeed(), to avoid overflow, so components that rely on
     * getCycles() returning steadily increasing values should also be prepared for a reset at any time.
     *
     * @this {CPU}
     * @param {boolean} [fScaled] is true if the caller wants a cycle count relative to a multiplier of 1
     * @return {number}
     */
    getCycles(fScaled)
    {
        var nCycles = this.nTotalCycles + this.nRunCycles + this.nBurstCycles - this.nStepCycles;
        if (fScaled && this.counts.nTargetMultiplier > 1 && this.counts.mhzCurrent > this.counts.mhzBase) {
            /*
             * We could scale the current cycle count by the current speed (this.counts.mhzCurrent); eg:
             *
             *      nCycles = Math.round(nCycles / (this.counts.mhzCurrent / this.counts.mhzBase));
             *
             * but that speed will fluctuate somewhat: large fluctuations at first, but increasingly smaller
             * fluctuations after each burst of instructions that runCPU() executes.
             *
             * Alternatively, we can scale the cycle count by the multiplier, which is good in that the
             * multiplier doesn't vary once the user changes it, but a potential downside is that the
             * multiplier might be set too high, resulting in a target speed that's higher than the effective
             * speed is able to reach.
             *
             * Also, if multipliers were always limited to a power-of-two, then this could be calculated
             * with a simple shift.  However, only the "setSpeed" UI binding limits it that way; the Debugger
             * interface allows any value, as does the CPU "multiplier" parmsCPU property (from the machine's
             * XML file).
             */
            nCycles = Math.round(nCycles / this.counts.nTargetMultiplier);
        }
        return nCycles;
    }

    /**
     * getBaseCyclesPerSecond()
     *
     * This returns the CPU's base speed (ie, the original cycles per second defined for the machine)
     *
     * @this {CPU}
     * @return {number}
     */
    getBaseCyclesPerSecond()
    {
        return this.counts.nBaseCyclesPerSecond;
    }

    /**
     * getCurrentCyclesPerSecond()
     *
     * This returns the CPU's current speed (ie, the actual cycles per second, according the current multiplier)
     *
     * @this {CPU}
     * @return {number}
     */
    getCurrentCyclesPerSecond()
    {
        return (this.counts.nBaseCyclesPerSecond * this.counts.nCurrentMultiplier)|0;
    }

    /**
     * resetCycles()
     *
     * Resets speed and cycle information as part of any reset() or restore(); this typically occurs during powerUp().
     * It's important that this be called BEFORE the actual restore() call, because restore() may want to call setSpeed(),
     * which in turn assumes that all the cycle counts have been initialized to sensible values.
     *
     * @this {CPU}
     */
    resetCycles()
    {
        this.nTotalCycles = this.nRunCycles = this.nBurstCycles = this.nStepCycles = 0;
        this.resetChecksum();
        this.setSpeed(this.counts.nBaseMultiplier);
    }

    /**
     * getSpeed()
     *
     * @this {CPU}
     * @return {number} the current speed multiplier
     */
    getSpeed()
    {
        return this.counts.nTargetMultiplier;
    }

    /**
     * getSpeedCurrent()
     *
     * @this {CPU}
     * @return {string} the current speed, in mhz, as a string formatted to two decimal places
     */
    getSpeedCurrent()
    {
        return ((this.flags.running && this.counts.mhzCurrent)? (this.counts.mhzCurrent.toFixed(2) + "Mhz") : "Stopped");
    }

    /**
     * getSpeedTarget()
     *
     * @this {CPU}
     * @return {string} the target speed, in mhz, as a string formatted to two decimal places
     */
    getSpeedTarget()
    {
        return this.counts.mhzTarget.toFixed(2) + "Mhz";
    }

    /**
     * setSpeed(nMultiplier, fUpdateFocus)
     *
     * @this {CPU}
     * @param {number} [nMultiplier] is the new proposed multiplier (reverts to default if target was too high)
     * @param {boolean} [fUpdateFocus] is true to update Computer focus
     * @return {boolean} true if successful, false if not
     *
     * @desc Whenever the speed is changed, the running cycle count and corresponding start time must be reset,
     * so that the next effective speed calculation obtains sensible results.  In fact, when runCPU() initially calls
     * setSpeed() with no parameters, that's all this function does (it doesn't change the current speed setting).
     */
    setSpeed(nMultiplier, fUpdateFocus)
    {
        var fSuccess = true;
        if (nMultiplier !== undefined) {
            /*
             * If we haven't reached 90% (0.9) of the current target speed, revert to the default multiplier.
             */
            if (this.counts.mhzCurrent > 0 && this.counts.mhzCurrent < this.counts.mhzTarget * 0.9) {
                nMultiplier = this.counts.nBaseMultiplier;
                fSuccess = false;
            }
            this.counts.mhzCurrent = 0;
            this.counts.nTargetMultiplier = nMultiplier;
            var mhzTarget = this.counts.mhzBase * this.counts.nTargetMultiplier;
            if (this.counts.mhzTarget != mhzTarget) {
                this.counts.mhzTarget = mhzTarget;
                var sSpeed = this.getSpeedTarget();
                var controlSpeed = this.bindings["setSpeed"];
                if (controlSpeed) controlSpeed.textContent = sSpeed;
                this.println("target speed: " + sSpeed);
            }
            if (fUpdateFocus && this.cmp) this.cmp.updateFocus();
        }
        this.addCycles(this.nRunCycles);
        this.nRunCycles = 0;
        this.counts.msStartRun = this.counts.msEndThisRun = 0;
        this.calcCycles();      // calculate a new value for the current cycle multiplier
        this.resetTimers();     // and then update all the fixed-period timers using the new cycle multiplier
        return fSuccess;
    }

    /**
     * calcSpeed(nCycles, msElapsed)
     *
     * @this {CPU}
     * @param {number} nCycles
     * @param {number} msElapsed
     */
    calcSpeed(nCycles, msElapsed)
    {
        if (msElapsed) {
            this.counts.mhzCurrent = Math.round(nCycles / (msElapsed * 10)) / 100;
            if (msElapsed >= 86400000) {
                this.nTotalCycles = 0;
                if (this.chipset) this.chipset.updateAllTimers(true);
                this.setSpeed();        // reset all counters once per day so that we never have to worry about overflow
            }
        }
    }

    /**
     * calcStartTime()
     *
     * @this {CPU}
     */
    calcStartTime()
    {
        this.calcCycles();

        this.counts.nCyclesThisRun = 0;
        this.counts.msStartThisRun = Usr.getTime();
        if (!this.counts.msStartRun) this.counts.msStartRun = this.counts.msStartThisRun;

        /*
         * Try to detect situations where the browser may have throttled us, such as when the user switches
         * to a different tab; in those situations, Chrome and Safari may restrict setTimeout() callbacks
         * to roughly one per second.
         *
         * Another scenario: the user resizes the browser window.  setTimeout() callbacks are not throttled,
         * but there can still be enough of a lag between the callbacks that CPU speed will be noticeably
         * erratic if we don't compensate for it here.
         *
         * We can detect throttling/lagging by verifying that msEndThisRun (which was set at the end of the
         * previous run and includes any requested sleep time) is comparable to the current msStartThisRun;
         * if the delta is significant, we compensate by bumping msStartRun forward by that delta.
         *
         * This shouldn't be triggered when the Debugger halts the CPU, because setSpeed() -- which is called
         * whenever the CPU starts running again -- zeroes msEndThisRun.
         *
         * This also won't do anything about other internal delays; for example, Debugger message() calls.
         * By the time the message() function has called yieldCPU(), the cost of the message has already been
         * incurred, so it will be end up being charged against the instruction(s) that triggered it.
         *
         * TODO: Consider calling yieldCPU() sooner from message(), so that it can arrange for the msEndThisRun
         * "snapshot" to occur sooner; it's unclear, however, whether that will really improve the CPU's ability
         * to hit its target speed, since you would expect any instruction that displays a message to be an
         * EXTREMELY slow instruction.
         */
        if (this.counts.msEndThisRun) {
            var msDelta = this.counts.msStartThisRun - this.counts.msEndThisRun;
            if (msDelta > this.counts.msPerYield) {
                if (MAXDEBUG) this.println("large time delay: " + msDelta + "ms");
                this.counts.msStartRun += msDelta;
                /*
                 * Bumping msStartRun forward should NEVER cause it to exceed msStartThisRun; however, just
                 * in case, I make absolutely sure it cannot happen, since doing so could result in negative
                 * speed calculations.
                 */
                this.assert(this.counts.msStartRun <= this.counts.msStartThisRun);
                if (this.counts.msStartRun > this.counts.msStartThisRun) {
                    this.counts.msStartRun = this.counts.msStartThisRun;
                }
            }
        }
    }

    /**
     * calcRemainingTime()
     *
     * @this {CPU}
     * @return {number}
     */
    calcRemainingTime()
    {
        this.counts.msEndThisRun = Usr.getTime();

        var msYield = this.counts.msPerYield;
        if (this.counts.nCyclesThisRun) {
            /*
             * Normally, we would assume we executed a full quota of work over msPerYield, but since the CPU
             * now has the option of calling yieldCPU(), that might not be true.  If nCyclesThisRun is correct, then
             * the ratio of nCyclesThisRun/nCyclesPerYield should represent the percentage of work we performed,
             * and so applying that percentage to msPerYield should give us a better estimate of work vs. time.
             */
            msYield = Math.round(msYield * this.counts.nCyclesThisRun / this.counts.nCyclesPerYield);
        }

        var msElapsedThisRun = this.counts.msEndThisRun - this.counts.msStartThisRun;
        var msRemainsThisRun = msYield - msElapsedThisRun;

        /*
         * We could pass only "this run" results to calcSpeed():
         *
         *      nCycles = this.counts.nCyclesThisRun;
         *      msElapsed = msElapsedThisRun;
         *
         * but it seems preferable to use longer time periods and hopefully get a more accurate speed.
         */
        var nCycles = this.nRunCycles;
        var msElapsed = this.counts.msEndThisRun - this.counts.msStartRun;

        if (MAXDEBUG && msRemainsThisRun < 0 && this.counts.nTargetMultiplier > 1) {
            this.println("warning: updates @" + msElapsedThisRun + "ms (prefer " + Math.round(msYield) + "ms)");
        }

        this.calcSpeed(nCycles, msElapsed);

        if (msRemainsThisRun < 0) {
            /*
             * Try "throwing out" the effects of large anomalies, by moving the overall run start time up;
             * ordinarily, this should only happen when the someone is using an external Debugger or some other
             * tool or feature that is interfering with our overall execution.
             */
            if (msRemainsThisRun < -1000) {
                this.counts.msStartRun -= msRemainsThisRun;
            }
            /*
             * If the last burst took MORE time than we allotted (ie, it's taking more than 1 second to simulate
             * nBaseCyclesPerSecond), all we can do is yield for as little time as possible (ie, 0ms) and hope
             * that the simulation is at least usable.
             */
            msRemainsThisRun = 0;
        }
        else if (this.counts.mhzCurrent < this.counts.mhzTarget) {
            msRemainsThisRun = 0;
        }

        if (DEBUG && this.messageEnabled(Messages.CPU)) {
            this.printMessage("calcRemainingTime: sleep " + msRemainsThisRun + "ms after " + (this.counts.msEndThisRun - this.counts.msStartThisRun) + "ms burst");
        }

        this.counts.msEndThisRun += msRemainsThisRun;
        return msRemainsThisRun;
    }

    /**
     * addTimer(id, callBack, ms)
     *
     * Components that want to have timers that fire after some number of milliseconds call addTimer() to create
     * the timer, and then setTimer() when they want to arm it.  Alternatively, they can specify an automatic timeout
     * value (in milliseconds) to have the timer fire automatically at regular intervals.  There is currently
     * no removeTimer() because these are generally used for the entire lifetime of a component.
     *
     * Internally, each timer entry is a preallocated Array with three entries:
     *
     *      [0]: countdown value, in cycles
     *      [1]: automatic setTimer value, if any, in milliseconds
     *      [2]: callback function
     *
     * A timer is initially dormant; dormant timers have a countdown value of -1 (although any negative number
     * will suffice) and active timers have a non-negative value.
     *
     * Why not use JavaScript's setTimeout() instead?  Good question.  For a good answer, see setTimer() below.
     *
     * @this {CPU}
     * @param {string} id
     * @param {function()} callBack
     * @param {number} [ms] (if set, enables automatic setTimer calls)
     * @return {number} timer index
     */
    addTimer(id, callBack, ms = -1)
    {
        var iTimer = this.aTimers.length;
        this.aTimers.push([id, -1, ms, callBack]);
        if (ms >= 0) this.setTimer(iTimer, ms);
        return iTimer;
    }

    /**
     * findTimer(id)
     *
     * @this {CPU}
     * @param {string} id
     * @return {Array|null}
     */
    findTimer(id)
    {
        for (var iTimer = 0; iTimer < this.aTimers.length; iTimer++) {
            var timer = this.aTimers[iTimer];
            if (timer[0] == id) return timer;
        }
        return null;
    }

    /**
     * setTimer(iTimer, ms, fReset)
     *
     * Using the timer index from a previous addTimer() call, this sets that timer to fire after the
     * specified number of milliseconds.
     *
     * This is preferred over JavaScript's setTimeout(), because all our timers are effectively paused when
     * the CPU is paused (eg, when the Debugger halts execution).  Moreover, setTimeout() handlers only run after
     * runCPU() yields, which is far too granular for some components (eg, when the SerialPort tries to simulate
     * interrupts at 9600 baud).
     *
     * Ideally, the only function that would use setTimeout() is runCPU(), while the rest of the components
     * use setTimer(); however, due to legacy code (ie, code that predates these functions) and/or laziness,
     * that may not be the case.
     *
     * @this {CPU}
     * @param {number} iTimer
     * @param {number} ms (converted into a cycle countdown internally)
     * @param {boolean} [fReset] (true if the timer should be reset even if already armed)
     * @return {number} (number of cycles used to arm timer, or -1 if error)
     */
    setTimer(iTimer, ms, fReset)
    {
        var nCycles = -1;
        if (iTimer >= 0 && iTimer < this.aTimers.length) {
            var timer = this.aTimers[iTimer];
            if (fReset || timer[1] < 0) {
                nCycles = this.getMSCycles(ms);
                /*
                 * We must now confront the following problem: if the CPU is currently executing a burst of cycles,
                 * the number of cycles it has executed in that burst so far must NOT be charged against the cycle
                 * timeout we're about to set.  The simplest way to resolve that is to immediately call endBurst()
                 * and bias the cycle timeout by the number of cycles that the burst executed.
                 */
                if (this.flags.running) {
                    nCycles += this.endBurst();
                }
                timer[1] = nCycles;
            }
        }
        return nCycles;
    }

    /**
     * setTimerCycles(iTimer, nCycles)
     *
     * A cycle-based version of setTimer(), used to help wean components off of functions like setBurstCycles().
     *
     * @this {CPU}
     * @param {number} iTimer
     * @param {number} nCycles
     * @return {boolean}
     */
    setTimerCycles(iTimer, nCycles)
    {
        if (iTimer >= 0 && iTimer < this.aTimers.length) {
            var timer = this.aTimers[iTimer];
            /*
             * We must now confront the following problem: if the CPU is currently executing a burst of cycles,
             * the number of cycles it has executed in that burst so far must NOT be charged against the cycle
             * timeout we're about to set.  The simplest way to resolve that is to immediately call endBurst()
             * and bias the cycle timeout by the number of cycles that the burst executed.
             */
            if (this.flags.running) {
                nCycles += this.endBurst();
            }
            timer[1] = nCycles;
            return true;
        }
        return false;
    }

    /**
     * getMSCycles(ms)
     *
     * @this {CPU}
     * @param {number} ms
     * @return {number} number of corresponding cycles
     */
    getMSCycles(ms)
    {
        return ((this.counts.nBaseCyclesPerSecond * this.counts.nCurrentMultiplier) / 1000 * ms)|0;
    }

    /**
     * getBurstCycles(nCycles)
     *
     * @this {CPU}
     * @param {number} nCycles (maximum number of cycles to execute)
     * @return {number}
     */
    getBurstCycles(nCycles)
    {
        for (var iTimer = this.aTimers.length - 1; iTimer >= 0; iTimer--) {
            var timer = this.aTimers[iTimer];
            this.assert(!isNaN(timer[1]));
            if (timer[1] < 0) continue;
            if (nCycles > timer[1]) {
                nCycles = timer[1];
            }
        }
        return nCycles;
    }

    /**
     * saveTimers()
     *
     * @this {CPU}
     * @return {Array}
     */
    saveTimers()
    {
        var aTimerStates = [];
        for (var iTimer = 0; iTimer < this.aTimers.length; iTimer++) {
            var timer = this.aTimers[iTimer];
            aTimerStates.push([timer[0], timer[1], timer[2]]);
        }
        return aTimerStates;
    }

    /**
     * restoreTimers(aTimerStates)
     *
     * @this {CPU}
     * @param {Array} aTimerStates
     */
    restoreTimers(aTimerStates)
    {
        for (var iTimerState = 0; iTimerState < aTimerStates.length; iTimerState++) {
            var state = aTimerStates[iTimerState];
            var timer = this.findTimer(state[0]);
            if (timer) {
                timer[1] = state[1];
                timer[2] = state[2];
            }
        }
    }

    /**
     * resetTimers()
     *
     * When the target CPU speed multiplier is altered, it's a good idea to run through all the timers that
     * have a fixed millisecond period and re-arm them, because the timers are using cycle counts that were based
     * on a previous multiplier.
     *
     * @this {CPU}
     */
    resetTimers()
    {
        for (var iTimer = this.aTimers.length - 1; iTimer >= 0; iTimer--) {
            var timer = this.aTimers[iTimer];
            if (timer[2] >= 0) this.setTimer(iTimer, timer[2], true);
        }
    }

    /**
     * updateTimers(nCycles)
     *
     * Used by runCPU() to reduce all active timer countdown values by the number of cycles just executed;
     * this is the function that actually "fires" any timer(s) whose countdown has reached (or dropped below)
     * zero, invoking their callback function.
     *
     * @this {CPU}
     * @param {number} nCycles (number of cycles actually executed)
     */
    updateTimers(nCycles)
    {
        for (var iTimer = this.aTimers.length - 1; iTimer >= 0; iTimer--) {
            var timer = this.aTimers[iTimer];
            this.assert(!isNaN(timer[1]));
            if (timer[1] < 0) continue;
            timer[1] -= nCycles;
            if (timer[1] <= 0) {
                if (DEBUG && this.messageEnabled(Messages.CPU)) {
                    this.printMessage("updateTimer(" + nCycles + "): firing " + timer[0] + " with only " + (timer[1] + nCycles) + " cycles left");
                }
                timer[1] = -1;      // zero is technically an "active" value, so ensure the timer is dormant now
                timer[3]();         // safe to invoke the callback function now
                if (timer[2] >= 0) {
                    this.setTimer(iTimer, timer[2]);
                    if (DEBUG && this.messageEnabled(Messages.CPU)) {
                        this.printMessage("updateTimer(" + nCycles + "): rearming " + timer[0] + " for " + timer[2] + "ms (" + timer[1] + " cycles)");
                    }
                }
            }
        }
    }

    /**
     * endBurst(fReset)
     *
     * @this {CPU}
     * @param {boolean} [fReset]
     * @return {number} (number of cycles executed in the most recent burst)
     */
    endBurst(fReset)
    {
        var nCycles = this.nBurstCycles -= this.nStepCycles;
        this.nStepCycles = 0;
        if (fReset) this.nBurstCycles = 0;
        return nCycles;
    }

    /**
     * runCPU()
     *
     * @this {CPU}
     */
    runCPU()
    {
        if (!this.flags.running) return;

        /*
         *  calcStartTime() initializes the cycle counter and timestamp for this runCPU() invocation.
         */
        this.calcStartTime();

        try {
            this.flags.yield = false;
            do {
                /*
                 * getBurstCycles() tells us how many cycles to execute as a burst.  The answer will always
                 * be less than getCurrentCyclesPerSecond(), because at the very least, our own timer fires more than
                 * once per second.
                 */
                var nCycles = this.getBurstCycles(this.flags.checksum? 1 : this.getCurrentCyclesPerSecond());

                if (this.chipset) {
                    this.chipset.updateAllTimers();
                    nCycles = this.chipset.getTimerCycleLimit(0, nCycles);
                    nCycles = this.chipset.getRTCCycleLimit(nCycles);
                }

                /*
                 * Execute the burst.
                 */
                try {
                    this.stepCPU(nCycles);
                }
                catch(exception) {
                    if (typeof exception != "number") throw exception;
                    if (MAXDEBUG) this.println("CPU exception " + Str.toHexByte(exception));
                    /*
                     * TODO: If we ever get into a situation where every single instruction is generating a fault
                     * (eg, if an 8088 executes opcode 0xFF 0xFF, which is incorrectly routed to helpFault() instead
                     * of fnGRPUndefined()), the browser may hang because we're failing to yield often enough.
                     * This is likely because the thrown exceptions are taking MUCH longer than normal instructions,
                     * throwing off our burst calculations.  We need to either adjust the burst or break out of the
                     * DO-WHILE loop on every exception.
                     */
                }

                /*
                 * Terminate the burst, returning the number of cycles that stepCPU() actually ran.
                 */
                nCycles = this.endBurst(true);

                /*
                 * Add nCycles to nCyclesThisRun, as well as nRunCycles (the cycle count since the CPU started).
                 */
                this.counts.nCyclesThisRun += nCycles;
                this.nRunCycles += nCycles;
                this.updateChecksum(nCycles);

                /*
                 * Update all timers, firing those whose cycle countdowns have reached (or dropped below) zero.
                 */
                this.updateTimers(nCycles);

            } while (this.flags.running && !this.flags.yield);
        }
        catch (e) {
            this.stopCPU();
            this.updateCPU();
            if (this.cmp) this.cmp.stop(Usr.getTime(), this.getCycles());
            this.setError(e.stack || e.message);
            return;
        }

        if (this.flags.running) setTimeout(this.onRunTimeout, this.calcRemainingTime());
    }

    /**
     * startCPU(fUpdateFocus)
     *
     * For use by any component that wants to start the CPU.
     *
     * @param {boolean} [fUpdateFocus]
     * @param {boolean} [fQuiet]
     * @return {boolean}
     */
    startCPU(fUpdateFocus, fQuiet)
    {
        if (this.isError()) {
            return false;
        }
        if (this.flags.running) {
            if (!fQuiet) this.println(this.toString() + " busy");
            return false;
        }
        /*
         *  setSpeed() without a speed parameter leaves the selected speed in place, but also resets the
         *  cycle counter and timestamp for the current series of runCPU() calls, and calculates the maximum number
         *  of cycles for each burst based on the last known effective CPU speed.
         */
        this.setSpeed();
        this.flags.running = true;
        this.flags.starting = true;
        if (this.chipset) this.chipset.start();
        var controlRun = this.bindings["run"];
        if (controlRun) controlRun.textContent = "Halt";
        if (this.cmp) {
            this.cmp.updateStatus(true);
            if (fUpdateFocus) this.cmp.updateFocus(true);
            this.cmp.start(this.counts.msStartRun, this.getCycles());
        }
        setTimeout(this.onRunTimeout, 0);
        return true;
    }

    /**
     * stepCPU(nMinCycles)
     *
     * This will be implemented by the X86CPU component.
     *
     * @this {CPU}
     * @param {number} nMinCycles (0 implies a single-step, and therefore breakpoints should be ignored)
     * @return {number} of cycles executed; 0 indicates that the last instruction was not executed
     */
    stepCPU(nMinCycles)
    {
        return 0;
    }

    /**
     * stopCPU(fComplete)
     *
     * For use by any component that wants to stop the CPU.
     *
     * @this {CPU}
     * @param {boolean} [fComplete]
     * @return {boolean} true if the CPU was stopped, false if it was already stopped
     */
    stopCPU(fComplete)
    {
        var fStopped = false;
        if (this.flags.running) {
            this.endBurst();
            this.addCycles(this.nRunCycles);
            this.nRunCycles = 0;
            this.flags.running = false;
            if (this.chipset) this.chipset.stop();
            var controlRun = this.bindings["run"];
            if (controlRun) controlRun.textContent = "Run";
            if (this.cmp) {
                this.cmp.stop(Component.getTime(), this.getCycles());
                this.cmp.updateStatus(true);
            }
            if (!this.dbg) this.status("Stopped");
            fStopped = true;
        }
        this.flags.complete = fComplete;
        return fStopped;
    }

    /**
     * updateCPU(fForce)
     *
     * This used to be performed at the end of every stepCPU(), but runCPU() -- which relies upon
     * stepCPU() -- needed to have more control over when these updates are performed.  However, for
     * other callers of stepCPU(), such as the Debugger, the combination of stepCPU() + updateCPU()
     * provides the old behavior.
     *
     * @this {CPU}
     * @param {boolean} [fForce] (true to force a Computer update; used by the Debugger)
     */
    updateCPU(fForce)
    {
        if (this.cmp) {
            this.cmp.updateStatus(fForce);
        }
    }

    /**
     * yieldCPU()
     *
     * Similar to stopCPU() with regard to how it resets various cycle countdown values, but the CPU
     * remains in a "running" state.
     *
     * @this {CPU}
     */
    yieldCPU()
    {
        this.endBurst();
        this.flags.yield = true;
        /*
         * The Debugger calls yieldCPU() after every message() to ensure browser responsiveness, but it looks
         * odd for those messages to show CPU state changes but for the CPU's own status display to not (ditto
         * for the Video display), so I've added this call to try to keep things looking synchronized.
         */
        this.updateCPU();
    }
}

CPU.YIELDS_PER_SECOND = 30;

CPU.BUTTONS = ["power", "reset"];

if (NODE) module.exports = CPU;
