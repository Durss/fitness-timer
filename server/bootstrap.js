"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPServer_1 = require("./server/HTTPServer");
const Config_1 = require("./utils/Config");
new HTTPServer_1.default(Config_1.default.SERVER_PORT);
