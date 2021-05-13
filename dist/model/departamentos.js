"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Departamentos = void 0;
const mongoose_1 = require("mongoose");
// Definimos el Schema
const departamentoSchema = new mongoose_1.Schema({
    _id: String,
    ingresoMensual: Number,
    sueldoHora: Number,
    proyectos: Array,
});
exports.Departamentos = mongoose_1.model('departamentos', departamentoSchema);
