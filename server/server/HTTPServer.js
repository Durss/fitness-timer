"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const http = require("http");
const Config_1 = require("../utils/Config");
const Logger_1 = require("../utils/Logger");
const historyApiFallback = require("connect-history-api-fallback");
const express = require("express");
class HTTPServer {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.doPrepareApp();
    }
    initError(error) {
        Logger_1.default.error("Error happened !", error);
    }
    doPrepareApp() {
        let server = new http.Server(this.app);
        server.listen(this.port);
        this.app.use(historyApiFallback({
            index: '/' + Config_1.default.SERVER_NAME + "/index.html",
            publicPath: Config_1.default.PUBLIC_PATH,
            // verbose:true,
            rewrites: [
                {
                    //Avoiding rewrites for API calls and socket
                    from: /.*\/(api|sock)\/?.*$/,
                    to: function (context) {
                        return context.parsedUrl.pathname;
                    }
                }
            ],
        }));
        let staticHandler = express.static(Config_1.default.PUBLIC_PATH);
        this.app.use(Config_1.default.SERVER_NAME + "/", staticHandler); //static files
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.all(Config_1.default.SERVER_NAME + "/*", (req, res, next) => {
            //Static assets
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });
    }
    listenHandler() {
        Logger_1.default.success("Server ready on port " + Config_1.default.SERVER_PORT + " :: server name \"" + Config_1.default.SERVER_NAME + "\"");
    }
    errorHandler(error, req, res, next) {
        Logger_1.default.error("Express error");
        console.log(error);
        let status = error.status || 500;
        let err = error.error || error;
        res.status(status);
        if (typeof err == "object")
            res.json(err);
        else {
            res.send(err);
        }
    }
}
exports.default = HTTPServer;
