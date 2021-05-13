export interface DepFondo {
      _id: string,
      ingresoMensual: number,
      financiacion: number,
      salarioEmpleados: number,
      costeProyectos: number,
      ganancias: number,
      pagos: number,
      fondos: number
}

export interface EmpleadosDep {
  _id: string,
  trabajadores:[
    {
      nombre: string,
      faltas: number,
      diasTrabajados: number,
      sueldo: number,
    }
  ]
}
export interface EmpleadoDep {
      nombre: string,
      faltas: number,
      diasTrabajados: number,
      sueldo: number,
}

export interface InversoresAbono{
  _id:string,
  abono:number
}

