import {Schema, model } from 'mongoose'

// Definimos el Schema
const empleadoSchema = new Schema({
  _id:String,
  nombre:String,
  fechaEntrada:Date,
  jornadaSemanal:Number,
  departamento:String,
  proyecto:Number,
  faltas:Number
})

export const Empleados = model('empleados',empleadoSchema)