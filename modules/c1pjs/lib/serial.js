/**
 * @fileoverview This file implements the C1Pjs SerialPort component.
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
    var Web         = require("../../shared/lib/weblib");
    var Component   = require("../../shared/lib/component");
}

/**
 * TODO: The Closure Compiler treats ES6 classes as 'struct' rather than 'dict' by default,
 * which would force us to declare all class properties in the constructor, as well as prevent
 * us from defining any named properties.  So, for now, we mark all our classes as 'unrestricted'.
 *
 * @unrestricted
 */
class C1PSerialPort extends Component {
    /**
     * C1PSerialPort(parmsSerial)
     *
     * The SerialPort component has no component-specific parameters.
     *
     * @this {C1PSerialPort}
     * @param {Object} parmsSerial
     */
    constructor(parmsSerial)
    {
        super("C1PSerialPort", parmsSerial);

        this.flags.powered = false;
        this.fDemo = parmsSerial['demo'];

        this.reset(true);
    }

    /**
     * @this {C1PSerialPort}
     * @param {boolean} [fHard]
     */
    reset(fHard)
    {
        /*
         * Because we reset the machine at the start of a 6502 HEX command file auto-load,
         * we must avoid tossing the serial port's input buffer in that particular case (2).
         */
        if (fHard || this.autoLoad != C1PSerialPort.AUTOLOAD_6502) {

            this.bInput = -1;
            this.iInput = 0;
            this.sInput = "";
            if (this.fDemo) {
                this.sInput = "10 PRINT \"HELLO OSI #" + this.getMachineNum() + "\"\n";
            }

         // this.sOutput = new Array(0);
         // this.iOutputNext = 0;

            this.fConvertLF = true;
            this.autoLoad = C1PSerialPort.AUTOLOAD_NONE;
        }
    }

    /**
     * @this {C1PSerialPort}
     */
    start()
    {
        if (this.kbd && this.fDemo) {
            this.kbd.injectKeys(" C\n\n", 3000);     // override the default injection delay (currently 300ms)
            setTimeout(function(serial) { return function() {serial.startLoad();}; }(this), 12000);
        }
        this.fDemo = false;
    }

    /**
     * @this {C1PSerialPort}
     * @param {string|null} sHTMLType is the type of the HTML control (eg, "button", "list", "text", "submit", "textarea")
     * @param {string} sBinding is the value of the 'binding' parameter stored in the HTML control's "data-value" attribute (eg, "listSerial")
     * @param {HTMLElement} control is the HTML control DOM object (eg, HTMLButtonElement)
     * @param {string} [sValue] optional data value
     * @return {boolean} true if binding was successful, false if unrecognized binding request
     */
    setBinding(sHTMLType, sBinding, control, sValue)
    {
        var serial = this;

        switch(sBinding) {

        case "listSerial":
            this.bindings[sBinding] = control;
            return true;

        case "loadSerial":
            this.bindings[sBinding] = control;

            control.onclick = function(event) {
                if (serial.bindings["listSerial"]) {
                    var sFile = serial.bindings["listSerial"].value;
                    // serial.println("loading " + sFile + "...");
                    Web.getResource(sFile, null, true, function(sURL, sResponse, nErrorCode) {
                        serial.loadFile(sURL, sResponse, nErrorCode);
                    });
                }
            };
            return true;

        case "mountSerial":
            /*
             * Check for non-mobile (desktop) browser and the availability of FileReader
             */
            if (!Web.isMobile() && window && 'FileReader' in window) {
                this.bindings[sBinding] = control;

                /*
                 * Enable "Mount" button only if a file is actually selected
                 */
                control.addEventListener('change', function() {
                    var fieldset = control.children[0];
                    var files = fieldset.children[0].files;
                    var submit = fieldset.children[1];
                    submit.disabled = !files.length;
                });

                control.addEventListener('submit', function(event) {
                    var file = event.currentTarget[1].files[0];

                    var reader = new FileReader();
                    reader.onload = function() {
                        // serial.println("mounting " + file.name + "...");
                        serial.loadFile(file.name, reader.result.toString(), 0);
                    };
                    reader.readAsText(file);

                    /*
                     * Prevent reloading of web page after form submission
                     */
                    return false;
                });
            }
            else {
                if (DEBUG) this.log("Local file support not available");
                control.parentNode.removeChild(/** @type {Node} */ (control));
            }
            return true;

        default:
            break;
        }
        return false;
    }

    /**
     * @this {C1PSerialPort}
     * @param {Array} abMemory
     * @param {number} start
     * @param {number} end
     * @param {C1PCPU} cpu
     */
    setBuffer(abMemory, start, end, cpu)
    {
        this.abMem = abMemory;
        this.offPort = start;
        this.cbPort = end - start + 1;
        this.offPortLimit = this.offPort + this.cbPort;
        if ((this.cpu = cpu)) {
            cpu.addReadNotify(start, end, this, this.getByte);
            cpu.addWriteNotify(start, end, this, this.setByte);
        }
        this.setReady();
    }

    /**
     * @this {C1PSerialPort}
     * @param {boolean} fOn
     * @param {C1PComputer} cmp
     *
     * We make a note of the Computer component, so that we can invoke its reset() method whenever we need to
     * simulate a warm start, and we query the Keyboard component so that we can use its injectKeys() function.
     */
    setPower(fOn, cmp)
    {
        if (fOn && !this.flags.powered) {
            this.flags.powered = true;
            this.cmp = cmp;
            this.kbd = cmp.getComponentByType("keyboard");
            if (DEBUGGER) this.dbg = cmp.getComponentByType("debugger");
        }
    }

    /**
     * @this {C1PSerialPort}
     */
    startLoad()
    {
        this.autoLoad = C1PSerialPort.AUTOLOAD_BASIC;
        this.kbd.injectKeys("LOAD\n");
    }

    /**
     * @this {C1PSerialPort}
     * @param {string} sFileName
     * @param {string} sFileData (null if getResource() encountered an error)
     * @param {number} nResponse from server
     */
    loadFile(sFileName, sFileData, nResponse)
    {
        if (!sFileData) {
            this.println("Error loading file \"" + sFileName + "\" (" + nResponse + ")");
            return;
        }

        this.iInput = 0;
        this.sInput = sFileData;
        this.fConvertLF = true;
        this.autoLoad = C1PSerialPort.AUTOLOAD_NONE;

        /*
         * The following code adds support for loading "65V" files encoded as JSON, which is a cleaner
         * way to store and deliver those files when they contain binary (non-ASCII) data.
         *
         * For example, my 6502 ASSEMBLER/DISASSEMBLER program starts with a conventional "65V" loading
         * sequence, which loads and launches a small program loader that loads the rest of the program
         * using a raw (1-to-1) binary format instead of the usual (3-to-1) HEX format used by "65V" files.
         *
         * The "rawness" of the binary format also necessitates disabling fConvertLF.
         */
        if (Str.endsWith(sFileName, ".json")) {
            try {
                /*
                 * The most likely source of any exception will be here: parsing the JSON-encoded data.
                 */
                var s = "";
                var data = eval("(" + sFileData + ")");
                var ab = data['bytes'];
                for (var i = 0; i < ab.length; i++) {
                    s += String.fromCharCode(ab[i]);
                }
                this.sInput = s;
                this.fConvertLF = false;
            } catch (e) {
                this.println("Error processing file \"" + sFileName + "\": " + e.message);
                return;
            }
        }

        if (this.cmp && this.kbd && this.cpu.isRunning()) {
            this.println("auto-loading " + sFileName);
            /*
             * QUESTION: Is this setFocus() call strictly necessary?  We're being called in the
             * context of getResource(), not some user action.  If there was an original user action,
             * then the handler for THAT action should take care to switch focus back, not us.
             */
            this.cpu.setFocus();
            /*
             * We interpret the presence of a "." at the beginning of the file as a "65V Monitor"
             * address-mode command, and consequently treat the file as 6502 HEX command file.
             *
             * Anything else is treated as commands for the BASIC interpreter, which we re-initialize
             * with "NEW" and "LOAD" commands.  To prevent that behavior, halt the CPU, perform the load,
             * and then start it running again.  BASIC will start reading the data as soon as you type
             * LOAD.
             */
            if (this.sInput.charAt(0) != '.') {
                this.autoLoad = C1PSerialPort.AUTOLOAD_BASIC;
                this.kbd.injectKeys("NEW\nLOAD\n");
            }
            else {
                /*
                 * Set autoLoad to AUTOLOAD_6502 before the reset, so that when our reset() method is called,
                 * we'll take care to preserve all the data we just loaded.
                 */
                this.autoLoad = C1PSerialPort.AUTOLOAD_6502;
                /*
                 * Although the Keyboard allows us to inject any key, even the BREAK key, like so:
                 *
                 *      this.kbd.injectKeys(String.fromCharCode(this.kbd.CHARCODE_BREAK))
                 *
                 * it's easier to initiate a reset() ourselves and then start the machine-language load process
                 */
                this.cmp.reset(true);
                this.kbd.injectKeys("ML");
            }
        }
        else {
            this.println(sFileName + " ready to load");
        }
    }

    /**
     * @this {C1PSerialPort}
     * @param {number} addr
     * @param {number|undefined} addrFrom (not defined whenever the Debugger tries to read the specified addr)
     */
    getByte(addr, addrFrom)
    {
        /*
         * Don't trigger any further hardware emulation (beyond what we've already stored in memory) if
         * the Debugger performed this read (need a special Debugger I/O command if/when you really want to do that).
         */
        if (addrFrom !== undefined) {
            /*
             *  WARNING: All I need to do for now is load the COM interface's "data byte"
             *  with the next byte from the virtual cassette data stream -JP
             */
            if (!(addr & 0x01)) {
                /*
                 * An EVEN address implies they're looking, so if we have a fresh buffer,
                 * then prime the pump.
                 */
                if (this.sInput && !this.iInput)
                    this.advanceInput();
            } else {
                /*
                 * An ODD address implies they just grabbed a data byte, so prep the next data byte.
                 */
                this.advanceInput();
            }
        }
    }

    /**
     * @this {C1PSerialPort}
     * @param {number} addr
     * @param {number|undefined} addrFrom (not defined whenever the Debugger tries to write the specified addr)
     */
    setByte(addr, addrFrom)
    {
        /*
         * Don't trigger any further hardware emulation (beyond what we've already stored in memory) if
         * the Debugger performed this write (need a special Debugger I/O command if/when you really want to do that).
         */
        if (addrFrom !== undefined) {
            if (DEBUGGER && this.dbg) this.dbg.messageIO(this, addr, addrFrom, this.dbg.MESSAGE_SERIAL, true);
            /*
             * WARNING: I don't yet care what state the CPU puts the port into.  When it's time to support serial output,
             * obviously that will become an issue.
             */
        }
    }

    /**
     * @this {C1PSerialPort}
     */
    advanceInput()
    {
        if (this.sInput !== undefined) {
            this.bInput = -1;
            if (this.iInput < this.sInput.length) {
                var b = this.sInput.charCodeAt(this.iInput++) & 0xff;
                if (this.fConvertLF) {
                    if (b == 0x0a) b = 0x0d;
                }
                this.bInput = b;
                // if (DEBUG) this.log("advanceInput(" + Str.toHexByte(b) + ")");
            }
            else {
                this.sInput = "";
                this.iInput = 0;
                if (DEBUG) this.log("advanceInput(): out of data");
                if (this.autoLoad == C1PSerialPort.AUTOLOAD_BASIC && this.kbd) {
                    this.kbd.injectKeys(" \nRUN\n");
                }
                this.autoLoad = C1PSerialPort.AUTOLOAD_NONE;
            }
            this.updateMemory();
        }
        // else if (DEBUG) this.log("advanceInput(): no input");
    }

    /**
     * @this {C1PSerialPort}
     */
    updateMemory()
    {
        var offset;
        /*
         * Update all the status (even) bytes
         */
        for (offset = this.offPort+0; offset < this.offPortLimit; offset+=2) {
            this.abMem[offset] = (this.bInput >= 0? C1PSerialPort.STATUS_DATA : C1PSerialPort.STATUS_NONE);
        }
        /*
         * Update all the data (odd) bytes
         */
        for (offset = this.offPort+1; offset < this.offPortLimit; offset+=2) {
            this.abMem[offset] = (this.bInput >= 0? this.bInput : 0);
        }
    }

    /**
     * C1PSerialPort.init()
     *
     * This function operates on every HTML element of class "serial", extracting the
     * JSON-encoded parameters for the C1PSerialPort constructor from the element's "data-value"
     * attribute, invoking the constructor to create a C1PSerialPort component, and then binding
     * any associated HTML controls to the new component.
     */
    static init()
    {
        var aeSerial = Component.getElementsByClass(document, C1PJS.APPCLASS, "serial");
        for (var iSerial=0; iSerial < aeSerial.length; iSerial++) {
            var eSerial = aeSerial[iSerial];
            var parmsSerial = Component.getComponentParms(eSerial);
            var serial = new C1PSerialPort(parmsSerial);
            Component.bindComponentControls(serial, eSerial, C1PJS.APPCLASS);
        }
    }
}

C1PSerialPort.STATUS_NONE   = 0x00;
C1PSerialPort.STATUS_DATA   = 0x01;     // indicates data available

/*
 * Values for autoLoad:
 *
 *      0: no auto-load active
 *      1: BASIC command file auto-load in progress
 *      2: 6502 HEX command file auto-load in progress
 */
C1PSerialPort.AUTOLOAD_NONE  = 0;
C1PSerialPort.AUTOLOAD_BASIC = 1;
C1PSerialPort.AUTOLOAD_6502  = 2;

/*
 * Initialize every SerialPort module on the page.
 */
Web.onInit(C1PSerialPort.init);
