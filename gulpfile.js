/**
 * @fileoverview Gulp file for pcjs.org
 * @author <a href="mailto:Jeff@pcjs.org">Jeff Parsons</a> (@jeffpar)
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
 * You are required to include the above copyright notice in every source code file of every
 * copy or modified version of this work, and to display that copyright notice on every screen
 * that loads or runs any version of this software (see COPYRIGHT in /modules/shared/lib/defines.js).
 *
 * Some PCjs files also attempt to load external resource files, such as character-image files,
 * ROM files, and disk image files. Those external resource files are not considered part of PCjs
 * for purposes of the GNU General Public License, and the author does not claim any copyright
 * as to their contents.
 */

/*
 * This is an experimental Gulp file; this will NOT yet build everything that Gruntfile.js builds,
 * so for normal development, you should continue using Grunt.
 * 
 * To learn Gulp, I started with a simple concatenation task ("mktmp") that combines all the files
 * required to compile a single emulation module (LEDs), and then I added a compilation task ("compile")
 * that runs the new JavaScript version of Google's Closure Compiler.
 * 
 * Unfortunately, the JavaScript version of the Closure Compiler appears to be MUCH slower than the
 * Java version.  But, it did uncover a few new type-related bugs in my code, which are now fixed.
 * 
 * Additional work is required to make Gulp skip tasks when the output file(s) are still newer
 * than the input file(s).  By default, every time you run Gulp, EVERYTHING is built again.  Apparently,
 * JavaScript developers think that simple declarative makefiles and automatic dependency checks are
 * too old-fashioned.
 */
var gulp = require("gulp");
var concat = require("gulp-concat");
var foreach = require("gulp-foreach");
var header = require("gulp-header");
var replace = require("gulp-replace");
var sequence = require("run-sequence");
var compiler = require('google-closure-compiler-js').gulp();

var fs = require("fs");
var path = require("path");
var pkg = require("./package.json");
var machineType = "leds";
var machine = pkg.machines[machineType];

var deviceTmpDir  = "./tmp/" + machine.folder + "/" + machine.version;
var deviceReleaseDir = "./versions/" + machine.folder + "/" + machine.version;
var deviceReleaseFile  = "leds.js";

var sExterns = "";
var sSiteHost = "www.pcjs.org";

for (var i = 0; i < pkg.closureCompilerExterns.length; i++) {
    var sContents = "";
    try {
        sContents = fs.readFileSync(pkg.closureCompilerExterns[i], "utf8");
    } catch(err) {
        console.log(err.message);
    }
    if (sContents) {
        if (sExterns) sExterns += '\n';
        sExterns += sContents;
    }
}

if (pkg.homepage) {
    var match = pkg.homepage.match(/^http:\/\/([^\/]*)(.*)/);
    if (match) sSiteHost = match[1];
}

gulp.task('mktmp', function() {
    return gulp.src(machine.files)
        .pipe(foreach(function(stream, file){
              return stream
                .pipe(header('/**\n * @copyright ' + file.path.replace(/.*\/(modules\/.*)/, "http://pcjs.org/$1") + ' (C) Jeff Parsons 2012-2017\n */\n\n'))
                .pipe(replace(/(^|\n)[ \t]*(['"])use strict\2;?/g, ""))
                .pipe(replace(/^(import|export)[ \t]+[^\n]*\n/gm, ""))
                .pipe(replace(/^[ \t]*var\s+\S+\s*=\s*require\((['"]).*?\1\);/gm, ""))
                .pipe(replace(/^[ \t]*(if\s+\(NODE\)\s*|)module\.exports\s*=\s*\S+;/gm, ""))
                .pipe(replace(/\/\*\*\s*\*\s*@fileoverview[\s\S]*?\*\/\s*/g, ""))
                .pipe(replace(/[ \t]*if\s*\(NODE\)\s*({[^}]*}|[^\n]*)(\n|$)/gm, ""))
                .pipe(replace(/[ \t]*if\s*\(typeof\s+module\s*!==\s*(['"])undefined\1\)\s*({[^}]*}|[^\n]*)(\n|$)/gm, ""))
                .pipe(replace(/\/\*\*[^@]*@typedef\s*{[^}]*}\s*(\S+)\s*([\s\S]*?)\*\//g, function(match, type, props) {
                    let sType = "/** @typedef {{ ";
                    let sProps = "";
                    let reProps = /@property\s*{([^}]*)}\s*(\[|)([^\s\]]+)\]?/g, matchProps;
                    while (matchProps = reProps.exec(props)) {
                        if (sProps) sProps += ", ";
                        sProps += matchProps[3] + ": " + (matchProps[2]? ("(" + matchProps[1] + "|undefined)") : matchProps[1]);
                    }
                    sType += sProps + " }} */\nvar " + type + ";";
                    return sType;
                }))
                .pipe(replace(/%%[ \t]*[A-Za-z_][A-Za-z0-9_.]*\.assert\([^\n]*\);[^\n]*/g, ""))
            }))        
        .pipe(concat(deviceReleaseFile))
        .pipe(header('"use strict";\n\n'))
        .pipe(gulp.dest(deviceTmpDir));
});

gulp.task('compile', function() {
    return gulp.src(path.join(deviceTmpDir, deviceReleaseFile) /*, {base: './'} */)
        .pipe(compiler({
            assumeFunctionWrapper: true,
            compilationLevel: 'ADVANCED',
            defines: {
                "COMPILED": true,
                "DEBUG": false
            },
            externs: [{src: sExterns}],
            warningLevel: 'VERBOSE',
            languageIn: "ES6",                          // this is now the default, just documenting our requirements
            languageOut: "ES5",                         // this is also the default
            outputWrapper: '(function(){%output%})()',
            jsOutputFile: deviceReleaseFile,            // TODO: This must vary according to debugger/non-debugger releases
            createSourceMap: false
        }))
        .pipe(gulp.dest(deviceReleaseDir));
});

gulp.task('default', function() {
    sequence(
        'mktmp', 'compile'
    );
});
