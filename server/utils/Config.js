"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Logger_1 = require("../utils/Logger");
/**
 * Created by Durss
 */
class Config {
    static get API_VERSION() {
        return this.getEnvData({
            dev: "v1",
            prod: "v1",
            standalone: "v1",
        });
    }
    static get LOGS_ENABLED() {
        return this.getEnvData({
            dev: true,
            prod: false,
        });
    }
    static get SERVER_PORT() {
        return this.getEnvData({
            dev: 3007,
            prod: 3007,
        });
    }
    static get PUBLIC_PATH() {
        return this.getEnvData({
            dev: "./dist",
            prod: "./public",
        });
    }
    static get SERVER_NAME() {
        return this.getEnvData({
            dev: "",
            prod: "",
        });
    }
    static get CONTROLLERS_PATH() {
        return this.getEnvData({
            dev: "./server/controllers",
            prod: "./controllers",
        });
    }
    /**
     * Extract a data from an hasmap depending on the current environment.
     * @param map
     * @returns {any}
     */
    static getEnvData(map) {
        //Grab env name the first time
        if (!this._ENV_NAME) {
            if (fs.existsSync(this._CONF_PATH)) {
                let content = fs.readFileSync(this._CONF_PATH, "utf8");
                this._ENV_NAME = content;
                let str = "  :: Current environment \"" + content + "\" ::  ";
                let head = str.replace(/./g, " ");
                console.log("\n");
                console.log(Logger_1.LogStyle.BgGreen + head + Logger_1.LogStyle.Reset);
                console.log(Logger_1.LogStyle.Bright + Logger_1.LogStyle.BgGreen + Logger_1.LogStyle.FgWhite + str + Logger_1.LogStyle.Reset);
                console.log(Logger_1.LogStyle.BgGreen + head + Logger_1.LogStyle.Reset);
                console.log("\n");
            }
            else {
                this._ENV_NAME = "dev";
                fs.writeFileSync(this._CONF_PATH, this._ENV_NAME);
                let str = "  /!\\ Missing file \"./" + this._CONF_PATH + "\" /!\\  ";
                let head = str.replace(/./g, " ");
                console.log("\n");
                console.log(Logger_1.LogStyle.BgRed + head + Logger_1.LogStyle.Reset);
                console.log(Logger_1.LogStyle.Bright + Logger_1.LogStyle.BgRed + Logger_1.LogStyle.FgWhite + str + Logger_1.LogStyle.Reset);
                console.log(Logger_1.LogStyle.BgRed + head + Logger_1.LogStyle.Reset);
                console.log("\n");
                console.log("Creating env.conf file autmatically and set it to \"standalone\"\n\n");
            }
        }
        //Get the data from hashmap
        if (map[this._ENV_NAME])
            return map[this._ENV_NAME];
        return map[Object.keys(map)[0]];
    }
}
exports.default = Config;
Config._CONF_PATH = "env.conf";
