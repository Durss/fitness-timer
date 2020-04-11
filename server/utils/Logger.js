"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
/**
 * Created by Durss on 16/03/2017
 */
class Logger {
    constructor() {
    }
    /********************
     * GETTER / SETTERS *
     ********************/
    /******************
     * PUBLIC METHODS *
     ******************/
    static log(message, ...more) {
        if (!Config_1.default.LOGS_ENABLED)
            return;
        let chunks = [message];
        chunks = chunks.concat(more);
        this.doLog(chunks.join(" "));
    }
    static simpleLog(message, ...more) {
        if (!Config_1.default.LOGS_ENABLED)
            return;
        let chunks = [message];
        chunks = chunks.concat(more);
        console.log("                            " + LogStyle.Reset + chunks.join(" ") + LogStyle.Reset);
    }
    static info(message, ...more) {
        if (!Config_1.default.LOGS_ENABLED)
            return;
        let chunks = [message];
        chunks = chunks.concat(more);
        this.doLog(LogStyle.FgCyan + chunks.join(" "));
    }
    static warn(message, ...more) {
        let chunks = [message];
        chunks = chunks.concat(more);
        this.doLog(LogStyle.FgYellow + chunks.join(" "));
    }
    static error(message, ...more) {
        let chunks = [message];
        chunks = chunks.concat(more);
        this.doLog(LogStyle.FgRed + chunks.join(" "));
    }
    static success(message, ...more) {
        let chunks = [message];
        chunks = chunks.concat(more);
        this.doLog(LogStyle.FgGreen + chunks.join(" "));
    }
    static faded(message, ...more) {
        let chunks = [message];
        chunks = chunks.concat(more);
        this.doLog(LogStyle.Dim + chunks.join(" "));
    }
    /*******************
     * PRIVATE METHODS *
     *******************/
    static convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        function pad2(s) { return (s < 10) ? '00' + s : (s < 100) ? '0' + s : s; }
        let d = new Date(inputFormat);
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/') + " " + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':') + ":" + pad2(d.getMilliseconds());
    }
    static doLog(mess) {
        console.log(LogStyle.Underscore + LogStyle.FgBlack + LogStyle.BgWhite + "[" + this.convertDate(new Date()) + "]" + LogStyle.Reset + " : " + mess + LogStyle.Reset);
    }
}
exports.default = Logger;
class LogStyle {
}
exports.LogStyle = LogStyle;
LogStyle.Reset = "\x1b[0m";
LogStyle.Bright = "\x1b[1m";
LogStyle.Dim = "\x1b[2m";
LogStyle.Underscore = "\x1b[4m";
LogStyle.Blink = "\x1b[5m";
LogStyle.Reverse = "\x1b[7m";
LogStyle.Hidden = "\x1b[8m";
LogStyle.FgBlack = "\x1b[30m";
LogStyle.FgRed = "\x1b[31m";
LogStyle.FgGreen = "\x1b[32m";
LogStyle.FgYellow = "\x1b[33m";
LogStyle.FgBlue = "\x1b[34m";
LogStyle.FgMagenta = "\x1b[35m";
LogStyle.FgCyan = "\x1b[36m";
LogStyle.FgWhite = "\x1b[37m";
LogStyle.BgBlack = "\x1b[40m";
LogStyle.BgRed = "\x1b[41m";
LogStyle.BgGreen = "\x1b[42m";
LogStyle.BgYellow = "\x1b[43m";
LogStyle.BgBlue = "\x1b[44m";
LogStyle.BgMagenta = "\x1b[45m";
LogStyle.BgCyan = "\x1b[46m";
LogStyle.BgWhite = "\x1b[47m";
