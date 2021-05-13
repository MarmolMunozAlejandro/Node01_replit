"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inversores = void 0;
const mongoose_1 = require("mongoose");
// Definimos el Schema
const inversorSchema = new mongoose_1.Schema({
    _id: Number,
    nombre: String,
    abono: Number,
});
exports.Inversores = mongoose_1.model('inversores', inversorSchema);
