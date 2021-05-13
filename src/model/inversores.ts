import {Schema, model } from 'mongoose'

// Definimos el Schema
const inversorSchema = new Schema({
    _id: Number,
    nombre: String,
    abono: Number,
    })

export const Inversores = model('inversores',inversorSchema)