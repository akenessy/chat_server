"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt_1 = __importDefault(require("bcrypt"));
var express_validator_1 = require("express-validator");
var mailer_1 = __importDefault(require("../core/mailer"));
var models_1 = require("../models");
var utils_1 = require("../utils");
var UserController = /** @class */ (function () {
    function UserController(io) {
        this.show = function (req, res) {
            var id = req.params.id;
            models_1.UserModel.findById(id, function (err, user) {
                if (err) {
                    return res.status(404).json({
                        message: "User not found",
                    });
                }
                res.json(user);
            });
        };
        this.getMe = function (req, res) {
            var id = req.user && req.user._id;
            models_1.UserModel.findById(id, function (err, user) {
                if (err || !user) {
                    return res.status(404).json({
                        message: "User not found",
                    });
                }
                res.json(user);
            });
        };
        this.findUsers = function (req, res) {
            var query = req.query.query;
            models_1.UserModel.find()
                .or([
                { fullname: new RegExp(query, "i") },
                { email: new RegExp(query, "i") },
            ])
                .then(function (users) { return res.json(users); })
                .catch(function (err) {
                return res.status(404).json({
                    status: "error",
                    message: err,
                });
            });
        };
        this.delete = function (req, res) {
            var id = req.params.id;
            models_1.UserModel.findOneAndRemove({ _id: id })
                .then(function (user) {
                if (user) {
                    res.json({
                        message: "User " + user.fullname + " deleted",
                    });
                }
                else {
                    res.status(404).json({
                        status: "error",
                    });
                }
            })
                .catch(function (err) {
                res.json({
                    message: err,
                });
            });
        };
        this.create = function (req, res) {
            var postData = {
                email: req.body.email,
                fullname: req.body.fullname,
                password: req.body.password,
            };
            var errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                res.status(422).json({ errors: errors.array() });
            }
            else {
                var user = new models_1.UserModel(postData);
                user
                    .save()
                    .then(function (obj) {
                    res.json(obj);
                    mailer_1.default.sendMail({
                        from: "zraev2004@bk.ru",
                        to: postData.email,
                        subject: "Подтверждение почты ChatiX",
                        html: "\n                <div style=\"font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333;\">\n                  <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;\">\n                    <h1 style=\"text-align: center; color: #2c3e50;\">\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u043E\u0447\u0442\u044B ChatiX</h1>\n                    <img src=\"https://s.iimg.su/s/27/ixrNxCz3P7bFmjwu7MLWK19jLvkfQst8wqSRhBN2.png\" alt=\"ChatiX Logo\" style=\"display: block; max-width: 100%; height: auto; margin: 0 auto; border-radius: 8px;\">\n                    <p style=\"font-size: 16px; line-height: 1.6; text-align: center;\">\u041F\u0440\u0438\u0432\u0435\u0442, <span style=\"font-weight: 600;\">" + postData.fullname + "</span>!</p>\n                    <p style=\"font-size: 16px; line-height: 1.6; text-align: center;\">\u0414\u043B\u044F \u0442\u043E\u0433\u043E, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u043F\u043E\u0447\u0442\u0443, \u043F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043F\u043E <a href=\"http://localhost:3000/signup/verify?hash=" + obj.confirm_hash + "\" style=\"color: #3498db; text-decoration: none;\">\u044D\u0442\u043E\u0439 \u0441\u0441\u044B\u043B\u043A\u0435</a>.</p>\n                  </div>\n                </div>\n              "
                    }, function (err, info) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(info);
                        }
                    });
                })
                    .catch(function (reason) {
                    res.status(500).json({
                        status: "error",
                        message: reason,
                    });
                });
            }
        };
        this.verify = function (req, res) {
            var hash = req.query.hash;
            if (!hash) {
                res.status(422).json({ errors: "Invalid hash" });
            }
            else {
                models_1.UserModel.findOne({ confirm_hash: hash }, function (err, user) {
                    if (err || !user) {
                        return res.status(404).json({
                            status: "error",
                            message: "Hash not found",
                        });
                    }
                    user.confirmed = true;
                    user.save(function (err) {
                        if (err) {
                            return res.status(404).json({
                                status: "error",
                                message: err,
                            });
                        }
                        res.json({
                            status: "success",
                            message: "Аккаунт успешно подтвержден!",
                        });
                    });
                });
            }
        };
        this.login = function (req, res) {
            var postData = {
                email: req.body.email,
                password: req.body.password,
            };
            var errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                res.status(422).json({ errors: errors.array() });
            }
            else {
                models_1.UserModel.findOne({ email: postData.email }, function (err, user) {
                    if (err || !user) {
                        return res.status(404).json({
                            message: "User not found",
                        });
                    }
                    if (bcrypt_1.default.compareSync(postData.password, user.password)) {
                        var token = utils_1.createJWToken(user);
                        res.json({
                            status: "success",
                            token: token,
                        });
                    }
                    else {
                        res.status(403).json({
                            status: "error",
                            message: "Incorrect password or email",
                        });
                    }
                });
            }
        };
        this.io = io;
    }
    return UserController;
}());
exports.default = UserController;
