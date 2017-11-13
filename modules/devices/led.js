/**
 * @fileoverview Simulates LEDs
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
 * <http://pcjs.org/modules/devices/machine.js>.
 *
 * Some PCjs files also attempt to load external resource files, such as character-image files,
 * ROM files, and disk image files. Those external resource files are not considered part of PCjs
 * for purposes of the GNU General Public License, and the author does not claim any copyright
 * as to their contents.
 */

"use strict";

/**
 * @typedef {Object} LEDConfig
 * @property {string} class
 * @property {Object} [bindings]
 * @property {number} [version]
 * @property {Array.<string>} [overrides]
 * @property {number} type
 * @property {number} width
 * @property {number} height
 * @property {number} cols
 * @property {number} rows
 * @property {string} color
 * @property {string} backgroundColor
 * @property {boolean} fixed
 * @property {boolean} persistent
 */

/**
 * The ultimate goal is to provide support for a variety of LED types, such as:
 *
 * 1) LED Light (single light)
 * 2) LED Digits (1 or more 7-segment digits)
 *
 * The initial goal is to manage a 12-element array of 7-segment LED digits for the TI-57.
 *
 * We create a "view" canvas element inside the specified "container" element, along with a "grid" canvas
 * where all the real drawing occurs; drawView() then renders the "grid" canvas onto the "view" canvas.
 *
 * Internally, our LED digits have a width and height of 96 and 128.  Those are "grid" dimensions which
 * cannot be changed, because our table of drawing coordinates in LED.SEGMENT are hard-coded for those
 * dimensions.  The cell width and height that are specified as part of the LEDConfig are "view" dimensions,
 * which usually match the grid dimensions, but you're welcome to scale them up or down; the browser's
 * drawImage() function takes care of that.
 *
 * There is a low-level function, drawGridSegment(), for drawing specific LED segments of specific digits;
 * generally, you start with clearGrid(), draw all the segments for a given update, and then call drawView()
 * to make them visible.
 *
 * However, our Chip device operates at a higher level.  We provide a "buffer" that the Chip can fill with
 * characters representing the digits that each of the LED cells should display, which the Chip updates by
 * calling setBuffer().  Then at whatever display refresh rate is set (typically 60Hz), drawBuffer() is called
 * to see if the buffer contents have been modified since the last refresh, and if so, it converts the contents
 * of the buffer to a string and calls drawString().
 *
 * This buffering strategy, combined with the buffer "tickled" flag (see below), not only makes life
 * simple for the Chip device, but also simulates how the display goes blank for short periods of time while
 * the Chip is busy performing calculations.
 *
 * @class {LED}
 * @unrestricted
 * @property {LEDConfig} config
 * @property {number} type (one of the LED.TYPE values)
 * @property {number} width (default is 96)
 * @property {number} height (default is 128)
 * @property {number} cols (default is 1)
 * @property {number} rows (default is 1)
 * @property {string} color (default is "red")
 * @property {string} backgroundColor (default is none; ie, transparent background)
 * @property {boolean} fixed (default is false, meaning the view may fill the container to its maximum size)
 * @property {boolean} persistent (default is false, meaning the view may be blanked if it hasn't been refreshed)
 * @property {number} widthView (computed)
 * @property {number} heightView (computed)
 * @property {number} widthGrid (computed)
 * @property {number} heightGrid (computed)
 * @property {HTMLCanvasElement} canvasView
 * @property {CanvasRenderingContext2D} contextView
 * @property {HTMLCanvasElement} canvasGrid
 * @property {CanvasRenderingContext2D} contextGrid
 * @property {{
 *  container: HTMLElement|undefined
 * }} bindings
 * @property {Array.<string|number>} buffer
 * @property {boolean} fBufferModified
 * @property {boolean} fTickled
 */
class LED extends Device {
    /**
     * LED(idMachine, idDevice, config)
     *
     * Sample config:
     *
     *      "display": {
     *        "class": "LED",
     *        "type": 3,
     *        "cols": 12,
     *        "rows": 1,
     *        "color": "red",
     *        "bindings": {
     *          "container": "displayTI57"
     *        }
     *      }
     *
     * @this {LED}
     * @param {string} idMachine
     * @param {string} idDevice
     * @param {LEDConfig} [config]
     */
    constructor(idMachine, idDevice, config)
    {
        super(idMachine, idDevice, LED.VERSION, config);

        let container = this.bindings[LED.BINDING.CONTAINER];
        if (container) {
            let canvasView = /** @type {HTMLCanvasElement} */ (document.createElement("canvas"));
            if (canvasView == undefined || !canvasView.getContext) {
                container.innerHTML = "Browser missing HTML5 canvas support";
            } else {
                this.canvasView = canvasView;

                this.type = this.config['type'];
                this.widthCell = (this.type == LED.TYPE.DIGIT? LED.DIGIT.WIDTH : 8);
                this.heightCell = (this.type == LED.TYPE.DIGIT? LED.DIGIT.HEIGHT : 8);
                this.width = this.config['width'] || this.widthCell;
                this.height = this.config['height'] || this.heightCell;
                this.cols = this.config['cols'] || 1;
                this.rows = this.config['rows'] || 1;
                this.widthView = this.width * this.cols;
                this.heightView = this.height * this.rows;
                this.color = (this.config['color'] || "red");
                this.colorDim = this.getRGBAColor(this.color, 1.0, 0.25);
                this.backgroundColor = this.config['backgroundColor'];

                if (!this.config['fixed']) {
                    canvasView.setAttribute("class", "pcjs-canvas");
                }
                this.fPersistent = !!this.config['persistent'];

                canvasView.setAttribute("width", this.widthView.toString());
                canvasView.setAttribute("height", this.heightView.toString());
                canvasView.style.backgroundColor = (this.backgroundColor || this.getRGBAColor("black", 0));
                container.appendChild(canvasView);
                this.contextView = /** @type {CanvasRenderingContext2D} */ (canvasView.getContext("2d"));

                /*
                 * canvasGrid is where all LED segments are composited; then they're drawn onto canvasView.
                 */
                this.canvasGrid = /** @type {HTMLCanvasElement} */ (document.createElement("canvas"));
                if (this.canvasGrid) {
                    this.canvasGrid.width = this.widthGrid = this.widthCell * this.cols;
                    this.canvasGrid.height = this.heightGrid = this.heightCell * this.rows;
                    this.contextGrid = this.canvasGrid.getContext("2d");
                }

                /*
                 * This records LED cell changes via setBuffer().  It contains two per elements per cell;
                 * the first records the primary character (eg, a digit) and the second records the secondary
                 * character, if any (eg, a decimal point).
                 */
                this.buffer = new Array(this.rows * this.cols * 2);

                /*
                 * fBufferModified is straightforward: set to true by any setBuffer() call that actually
                 * changed something in the buffer, set to false after every drawBuffer() call, periodic or
                 * otherwise.
                 *
                 * fTickled is a flag which, under normal (idle) circumstances, will constantly be set to
                 * true by periodic DISP calls to setBuffer(); we clear it after every periodic drawBuffer(),
                 * so if the machine fails to execute a setBuffer() in a timely manner, we will see that
                 * fTickled hasn't been "tickled", and automatically blank the screen.
                 */
                this.fBufferModified = this.fTickled = false;

                this.time = /** @type {Time} */ (this.findDeviceByClass(Machine.CLASS.TIME));
                if (this.time) {
                    this.time.addAnimator(this.drawBuffer.bind(this));
                }
            }
        }
    }

    /**
     * clearBuffer(fDraw)
     *
     * @this {LED}
     * @param {boolean} [fDraw]
     */
    clearBuffer(fDraw)
    {
        let i = 0;
        while (i < this.buffer.length) {
            if (this.type < LED.TYPE.DIGIT) {
                this.buffer[i++] = LED.STATE.OFF;
                this.buffer[i++] = LED.STATE.DIRTY;
            } else {
                this.buffer[i++] = ' ';
                this.buffer[i++] = '';
            }
        }
        this.fBufferModified = this.fTickled = true;
        if (fDraw) this.drawBuffer(true);
    }

    /**
     * clearGrid()
     *
     * @this {LED}
     */
    clearGrid()
    {
        if (this.backgroundColor) {
            this.contextGrid.fillStyle = this.backgroundColor;
            this.contextGrid.fillRect(0, 0, this.widthGrid, this.heightGrid);
        } else {
            this.contextGrid.clearRect(0, 0, this.widthGrid, this.heightGrid);
        }
    }

    /**
     * drawBuffer(fForced)
     *
     * This is our periodic (60Hz) redraw function; however, it can also be called synchronously
     * (eg, see clearBuffer()).  The other important periodic side-effect of this function is clearing
     * fTickled, so that if no other setBuffer() calls occur between now and the next drawBuffer(),
     * an automatic clearBuffer() will be triggered.  This simulates the normal blanking of the screen
     * whenever the machine performs lengthy calculations, because for the LED display to remain on,
     * the machine must perform a DISP operation at least 30-60 times per second.
     *
     * @this {LED}
     * @param {boolean} fForced
     */
    drawBuffer(fForced)
    {
        if (this.fBufferModified || fForced) {
            if (this.type < LED.TYPE.DIGIT) {
                this.drawGrid(fForced);
            } else {
                let s = "", i = 0;
                while (i < this.buffer.length) {
                    s += this.buffer[i++] || ' ';
                    s += this.buffer[i++] || '';
                }
                this.drawString(s);
            }
            this.fBufferModified = false;
        }
        else if (!this.fPersistent && !this.fTickled) {
            this.clearBuffer(true);
        }
        this.fTickled = false;
    }

    /**
     * drawGrid(fForced)
     *
     * Used by drawBuffer() for LED.TYPE.ROUND and LED.TYPE.SQUARE.
     *
     * @this {LED}
     * @param {boolean} fForced
     */
    drawGrid(fForced)
    {
        if (!this.fPersistent || fForced) {
            this.clearGrid();
        }
        let i = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                let state = this.buffer[i++];
                let stateDirty = this.buffer[i++];
                if (stateDirty || fForced) {
                    this.drawGridCell(state, col, row);
                    this.buffer[i-1] = LED.STATE.CLEAN;
                }
            }
        }
        this.drawView();
    }

    /**
     * drawGridCell(state, col, row)
     *
     * Used by drawGrid() for LED.TYPE.ROUND and LED.TYPE.SQUARE.
     *
     * @this {LED}
     * @param {string} state (eg, LED.STATE.ON or LED.STATE.OFF)
     * @param {number} [col] (default is zero)
     * @param {number} [row] (default is zero)
     */
    drawGridCell(state, col = 0, row = 0)
    {
        let xBias = col * this.widthCell;
        let yBias = row * this.heightCell;
        this.contextGrid.fillStyle = (state? this.color : this.colorDim);
        let coords = LED.SHAPES[this.type];
        if (coords.length == 3) {
            this.contextGrid.beginPath();
            this.contextGrid.arc(coords[0] + xBias, coords[1] + yBias, coords[2], 0, Math.PI*2);
            this.contextGrid.fill();
        } else {
            this.contextGrid.fillRect(coords[0] + xBias, coords[1] + yBias, coords[2], coords[3]);
        }
    }

    /**
     * drawGridSegment(seg, col, row)
     *
     * Used by drawSymbol() for LED.TYPE.DIGIT.
     *
     * @this {LED}
     * @param {string} seg (eg, "A")
     * @param {number} [col] (default is zero)
     * @param {number} [row] (default is zero)
     */
    drawGridSegment(seg, col = 0, row = 0)
    {
        let coords = LED.SEGMENT[seg];
        if (coords) {
            let xBias = col * this.widthCell;
            let yBias = row * this.heightCell;
            this.contextGrid.fillStyle = this.color;
            this.contextGrid.beginPath();
            if (coords.length == 3) {
                this.contextGrid.arc(coords[0] + xBias, coords[1] + yBias, coords[2], 0, Math.PI*2);
            } else {
                for (let i = 0; i < coords.length; i += 2) {
                    if (!i) {
                        this.contextGrid.moveTo(coords[i] + xBias, coords[i + 1] + yBias);
                    } else {
                        this.contextGrid.lineTo(coords[i] + xBias, coords[i + 1] + yBias);
                    }
                }
            }
            this.contextGrid.closePath();
            this.contextGrid.fill();
        }
    }

    /**
     * drawString(s)
     *
     * Used by drawBuffer() for LED.TYPE.DIGIT.
     *
     * @this {LED}
     * @param {string} s
     */
    drawString(s)
    {
        this.clearGrid();
        for (let i = 0, col = 0, row = 0; i < s.length; i++) {
            let ch = s[i];
            if (ch == '.') {
                if (col) col--;
            }
            this.drawSymbol(ch, col, row);
            if (++col == this.cols) {
                col = 0;
                if (++row == this.rows) {
                    break;
                }
            }
        }
        this.drawView();
    }

    /**
     * drawSymbol(symbol, col, row)
     *
     * Used by drawString() for LED.TYPE.DIGIT.
     *
     * If the symbol does not exist in LED.SYMBOLS, then nothing is drawn.
     *
     * @this {LED}
     * @param {string} symbol
     * @param {number} [col] (default is zero)
     * @param {number} [row] (default is zero)
     */
    drawSymbol(symbol, col = 0, row = 0)
    {
        let segments = LED.SYMBOLS[symbol];
        if (segments) {
            for (let i = 0; i < segments.length; i++) {
                this.drawGridSegment(segments[i], col, row)
            }
        }
    }

    /**
     * drawView()
     *
     * @this {LED}
     */
    drawView()
    {
        /*
         * Setting the 'globalCompositeOperation' property of a 2D context is something you rarely need to do,
         * because the default draw behavior ("source-over") is fine for most cases.  One case where it is NOT
         * fine is when we're using a transparent background color (ie, the backgroundColor property is not set),
         * because it doesn't copy over any transparent pixels, effectively making it impossible to "turn off" any
         * previously drawn LED segments.  To force that behavior, we must select the "copy" behavior.
         *
         * Refer to: https://www.w3.org/TR/2dcontext/#dom-context-2d-globalcompositeoperation
         */
        this.contextView.globalCompositeOperation = (this.backgroundColor && !this.fPersistent)? "source-over" : "copy";
        this.contextView.drawImage(this.canvasGrid, 0, 0, this.widthGrid, this.heightGrid, 0, 0, this.widthView, this.heightView);
    }

    /**
     * getRGBAColor(sColor, alpha, brightness)
     *
     * Returns a color in the "rgba" format that fillStyle recognizes (eg, "rgba(255, 255, 255, 0)").
     *
     * I used to use "alpha" to adjust the brightness, but it's safer to use the "brightness" parameter,
     * which simply scales all the RGB values.  If any shapes are redrawn using a fill style with alpha < 1.0,
     * the target alpha values will be added instead of replaced, resulting in progressively brighter shapes.
     *
     * @param {string} sColor
     * @param {number} [alpha]
     * @param {number} [brightness]
     * @returns {string}
     */
    getRGBAColor(sColor, alpha = 1.0, brightness = 1.0)
    {
        sColor = LED.COLORS[sColor] || sColor;
        let match = sColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (match) {
            sColor = "rgba(";
            for (let i = 1; i <= 3; i++) sColor += Math.round(Number.parseInt(match[i], 16) * brightness) + ",";
            sColor += alpha + ")";
        }
        return sColor;
    }

    /**
     * setBuffer(col, row, d1, d2)
     *
     * @this {LED}
     * @param {number} col
     * @param {number} row
     * @param {string|number} d1
     * @param {string|number} [d2]
     * @returns {boolean} (true if this call modified the buffer, false if not)
     */
    setBuffer(col, row, d1, d2)
    {
        let fModified = false;
        let i = (row * this.cols + col) * 2;
        this.assert(row >= 0 && row < this.rows && col >= 0 && col < this.cols);
        if (this.buffer[i] !== d1 || d2 !== undefined && this.buffer[i+1] !== d2) {
            this.buffer[i] = d1;
            this.buffer[i+1] = (d2 !== undefined? d2 : LED.STATE.DIRTY);
            this.fBufferModified = fModified = true;
        }
        this.fTickled = true;
        return fModified;
    }
}

LED.TYPE = {
    ROUND:      1,      // a single (round) LED
    SQUARE:     2,      // a single (square) LED
    DIGIT:      3       // a 7-segment (digit) LED, with a period as an 8th segment
};

LED.BINDING = {
    CONTAINER:  "container"
};

LED.STATE = {
    OFF:        0,
    ON:         1,
    CLEAN:      0,
    DIRTY:      3
};

LED.SHAPES = {
    [LED.TYPE.ROUND]:   [4, 4, 3],
    [LED.TYPE.SQUARE]:  [1, 1, 6, 6]
};

/*
 * For LED.TYPE.DIGIT, each cell has the following width and height.
 */
LED.DIGIT = {
    WIDTH:      96,
    HEIGHT:     128
};

LED.COLORS = {
    "aliceblue":            "#f0f8ff",
    "antiquewhite":         "#faebd7",
    "aqua":                 "#00ffff",
    "aquamarine":           "#7fffd4",
    "azure":                "#f0ffff",
    "beige":                "#f5f5dc",
    "bisque":               "#ffe4c4",
    "black":                "#000000",
    "blanchedalmond":       "#ffebcd",
    "blue":                 "#0000ff",
    "blueviolet":           "#8a2be2",
    "brown":                "#a52a2a",
    "burlywood":            "#deb887",
    "cadetblue":            "#5f9ea0",
    "chartreuse":           "#7fff00",
    "chocolate":            "#d2691e",
    "coral":                "#ff7f50",
    "cornflowerblue":       "#6495ed",
    "cornsilk":             "#fff8dc",
    "crimson":              "#dc143c",
    "cyan":                 "#00ffff",
    "darkblue":             "#00008b",
    "darkcyan":             "#008b8b",
    "darkgoldenrod":        "#b8860b",
    "darkgray":             "#a9a9a9",
    "darkgreen":            "#006400",
    "darkkhaki":            "#bdb76b",
    "darkmagenta":          "#8b008b",
    "darkolivegreen":       "#556b2f",
    "darkorange":           "#ff8c00",
    "darkorchid":           "#9932cc",
    "darkred":              "#8b0000",
    "darksalmon":           "#e9967a",
    "darkseagreen":         "#8fbc8f",
    "darkslateblue":        "#483d8b",
    "darkslategray":        "#2f4f4f",
    "darkturquoise":        "#00ced1",
    "darkviolet":           "#9400d3",
    "deeppink":             "#ff1493",
    "deepskyblue":          "#00bfff",
    "dimgray":              "#696969",
    "dodgerblue":           "#1e90ff",
    "firebrick":            "#b22222",
    "floralwhite":          "#fffaf0",
    "forestgreen":          "#228b22",
    "fuchsia":              "#ff00ff",
    "gainsboro":            "#dcdcdc",
    "ghostwhite":           "#f8f8ff",
    "gold":                 "#ffd700",
    "goldenrod":            "#daa520",
    "gray":                 "#808080",
    "green":                "#008000",
    "greenyellow":          "#adff2f",
    "honeydew":             "#f0fff0",
    "hotpink":              "#ff69b4",
    "indianred ":           "#cd5c5c",
    "indigo":               "#4b0082",
    "ivory":                "#fffff0",
    "khaki":                "#f0e68c",
    "lavender":             "#e6e6fa",
    "lavenderblush":        "#fff0f5",
    "lawngreen":            "#7cfc00",
    "lemonchiffon":         "#fffacd",
    "lightblue":            "#add8e6",
    "lightcoral":           "#f08080",
    "lightcyan":            "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey":            "#d3d3d3",
    "lightgreen":           "#90ee90",
    "lightpink":            "#ffb6c1",
    "lightsalmon":          "#ffa07a",
    "lightseagreen":        "#20b2aa",
    "lightskyblue":         "#87cefa",
    "lightslategray":       "#778899",
    "lightsteelblue":       "#b0c4de",
    "lightyellow":          "#ffffe0",
    "lime":                 "#00ff00",
    "limegreen":            "#32cd32",
    "linen":                "#faf0e6",
    "magenta":              "#ff00ff",
    "maroon":               "#800000",
    "mediumaquamarine":     "#66cdaa",
    "mediumblue":           "#0000cd",
    "mediumorchid":         "#ba55d3",
    "mediumpurple":         "#9370d8",
    "mediumseagreen":       "#3cb371",
    "mediumslateblue":      "#7b68ee",
    "mediumspringgreen":    "#00fa9a",
    "mediumturquoise":      "#48d1cc",
    "mediumvioletred":      "#c71585",
    "midnightblue":         "#191970",
    "mintcream":            "#f5fffa",
    "mistyrose":            "#ffe4e1",
    "moccasin":             "#ffe4b5",
    "navajowhite":          "#ffdead",
    "navy":                 "#000080",
    "oldlace":              "#fdf5e6",
    "olive":                "#808000",
    "olivedrab":            "#6b8e23",
    "orange":               "#ffa500",
    "orangered":            "#ff4500",
    "orchid":               "#da70d6",
    "palegoldenrod":        "#eee8aa",
    "palegreen":            "#98fb98",
    "paleturquoise":        "#afeeee",
    "palevioletred":        "#d87093",
    "papayawhip":           "#ffefd5",
    "peachpuff":            "#ffdab9",
    "peru":                 "#cd853f",
    "pink":                 "#ffc0cb",
    "plum":                 "#dda0dd",
    "powderblue":           "#b0e0e6",
    "purple":               "#800080",
    "rebeccapurple":        "#663399",
    "red":                  "#ff0000",
    "rosybrown":            "#bc8f8f",
    "royalblue":            "#4169e1",
    "saddlebrown":          "#8b4513",
    "salmon":               "#fa8072",
    "sandybrown":           "#f4a460",
    "seagreen":             "#2e8b57",
    "seashell":             "#fff5ee",
    "sienna":               "#a0522d",
    "silver":               "#c0c0c0",
    "skyblue":              "#87ceeb",
    "slateblue":            "#6a5acd",
    "slategray":            "#708090",
    "snow":                 "#fffafa",
    "springgreen":          "#00ff7f",
    "steelblue":            "#4682b4",
    "tan":                  "#d2b48c",
    "teal":                 "#008080",
    "thistle":              "#d8bfd8",
    "tomato":               "#ff6347",
    "turquoise":            "#40e0d0",
    "violet":               "#ee82ee",
    "wheat":                "#f5deb3",
    "white":                "#ffffff",
    "whitesmoke":           "#f5f5f5",
    "yellow":               "#ffff00",
    "yellowgreen":          "#9acd32"
};

/*
 * The segments are arranged roughly as follows in a 96x128 grid:
 *
 *      AAAA
 *     F    B
 *     F    B
 *      GGGG
 *     E    C
 *     E    C
 *      DDDD P
 *
 * The following arrays specify pairs of moveTo()/lineTo() coordinates, used by drawGridSegment().  They all
 * assume the hard-coded LED.DIGIT.WIDTH and LED.DIGIT.HEIGHT specified above.  If there is a triplet instead of
 * one or more pairs (eg, the 'P' or period segment), then the coordinates are treated as arc() parameters.
 */
LED.SEGMENT = {
    'A':        [30,  8, 79,  8, 67, 19, 37, 19],
    'B':        [83, 10, 77, 52, 67, 46, 70, 22],
    'C':        [77, 59, 71,100, 61, 89, 64, 64],
    'D':        [28, 91, 58, 91, 69,104, 15,104],
    'E':        [18, 59, 28, 64, 25, 88, 12,100],
    'F':        [24, 10, 34, 21, 31, 47, 18, 52],
    'G':        [24, 56, 34, 50, 60, 50, 71, 56, 61, 61, 33, 61],
    'P':        [80,102, 8]
};

/*
 * Symbols are formed with the following segments.
 */
LED.SYMBOLS = {
    ' ':        [],
    '0':        ['A','B','C','D','E','F'],
    '1':        ['B','C'],
    '2':        ['A','B','D','E','G'],
    '3':        ['A','B','C','D','G'],
    '4':        ['B','C','F','G'],
    '5':        ['A','C','D','F','G'],
    '6':        ['A','C','D','E','F','G'],
    '7':        ['A','B','C'],
    '8':        ['A','B','C','D','E','F','G'],
    '9':        ['A','B','C','D','F','G'],
    '-':        ['G'],
    'E':        ['A','D','E','F','G'],
    '.':        ['P']
};

LED.VERSION     = 1.03;
