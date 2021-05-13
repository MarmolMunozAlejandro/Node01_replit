import mongoose from 'mongoose';

class DataBase {

  //private _cadenaConexion: string = 'mongodb://localhost/test'
  //  private _cadenaConexion: string =  
  //  `mongodb+srv://prueba:prueba@cluster0.viyli.mongodb.net/prueba?retryWrites=true&w=majority`
private _cadenaConexion: string = 
'mongodb+srv://invitado:invitado@cluster0.jctvh.mongodb.net/MarmolCenter?retryWrites=true&w=majority'
    constructor(){

    }
    set cadenaConexion(_cadenaConexion: string){
        this._cadenaConexion = _cadenaConexion
    }

    conectarBD = async () => {
        const promise = new Promise<string>( async (resolve, reject) => {
            await mongoose.connect(this._cadenaConexion, {
                useNewUrlParser: true, 
                useUnifiedTopology: true, 
                useCreateIndex: true,   // Para que cree el índice único asociado al campo unique
                useFindAndModify: false  // para usar findOneAndDelete y findAndModify
            })
            .then( () => resolve(`Conectado a ${this._cadenaConexion}`) )
            .catch( (error) => reject(`Error conectando a ${this._cadenaConexion}: ${error}`) )     
        })
        return promise

    }

    desconectarBD = async () => {
        const promise = new Promise<string>( async (resolve, reject) => {
            await mongoose.disconnect() 
            .then( () => resolve(`Desconectado de ${this._cadenaConexion}`) )
            .catch( (error) => reject(`Error desconectando de ${this._cadenaConexion}: ${error}`) )     
        })
        return promise
    }
}

export const db = new DataBase()