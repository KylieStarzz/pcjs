#!/usr/bin/env node
/**
 * @fileoverview Tool for converting dump of 32-bit floating-point numbers to 16-bit little-endian words
 * @author <a href="mailto:Jeff@pcjs.org">Jeff Parsons</a>
 * @copyright © Jeff Parsons 2012-2017
 * @suppress {missingProperties}
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

var fs = require("fs");

/**
 * processFile(sFileIn, sFileOut)
 *
 * @param {string} sFileIn
 * @param {string} sFileOut
 */
function processFile(sFileIn, sFileOut) {
    try {
        let sInput = fs.readFileSync(sFileIn, "binary");
        let aWords = sInput.match(/[0-9a-z]{8}/g);
        console.log("outputting " + aWords.length + " words...");
        let bufOut = Buffer.alloc(aWords.length * 2);
        let bufNum = new ArrayBuffer(4);
        let i32View = new Int32Array(bufNum);
        let fp32View = new Float32Array(bufNum);
        for (let iByte = 0, iWord = 0; iWord < aWords.length; iWord++) {
            i32View[0] = Number.parseInt(aWords[iWord], 16);
            let w = Math.trunc(fp32View[0]);
            bufOut[iByte++] = w & 0xff;
            bufOut[iByte++] = w >> 8;
        }
        fs.writeFileSync(sFileOut, bufOut);
    }
    catch (err) {
        console.log(err.message);
    }
}

if (process.argv.length <= 2) {
    console.log("usage: node fp2le.js [input filename] [output filename]");
    process.exit();
}

processFile(process.argv[2], process.argv[3]);
