"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Created by edoua on 30/07/2017.
 */
const express = require("express");
const glob = require("glob");
const ExpressAnnotations_1 = require("./ExpressAnnotations");
class AbstractExpressServer {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.controllerLoaded = Promise.resolve();
        this.doPrepareApp();
    }
    listen() {
        this.controllerLoaded.then(_ => {
            this.app.use((error, request, result, next) => {
                this.errorHandler(error, request, result, next);
            });
            this.listenHandler();
            // this.app.listen(this.port, () => this.listenHandler ());
        });
        return this;
    }
    loadController(controllers) {
        this.controllerLoaded = new Promise((resolve, reject) => {
            glob(controllers, (error, files) => {
                if (error) {
                    reject(error);
                    return;
                }
                for (let file of files) {
                    let module = require(`${process.cwd()}/${file}`);
                    for (let prop in module) {
                        if (module.hasOwnProperty(prop) && typeof module[prop] == "function") {
                            new module[prop]();
                        }
                    }
                }
                resolve();
            });
        }).catch(error => {
            this.initError(error);
        });
        return this;
    }
    loadControllers(module) {
        this.controllerLoaded = new Promise((resolve, reject) => {
            for (let prop in module) {
                if (module.hasOwnProperty(prop) && typeof module[prop] == "function") {
                    new module[prop]();
                }
            }
            resolve();
        }).catch(error => {
            this.initError(error);
        });
        return this;
    }
    errorHandler(error, req, res, next) {
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
tslib_1.__decorate([
    ExpressAnnotations_1.ExpressApp
], AbstractExpressServer.prototype, "app", void 0);
exports.AbstractExpressServer = AbstractExpressServer;
