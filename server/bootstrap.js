"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPServer_1 = require("./server/HTTPServer");
const Config_1 = require("./utils/Config");
let server = new HTTPServer_1.default(Config_1.default.SERVER_PORT);
server.loadController(Config_1.default.CONTROLLERS_PATH + "/*.js").listen();
