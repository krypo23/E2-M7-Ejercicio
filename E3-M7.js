const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL_USUARIOS
});

async function insertarTarea(titulo, descripcion){
    const consulta = 'INSERT INTO tareas (titulo, descripcion) VALUES ($1, $2)';
    const valores = [titulo, descripcion];

    try {
        const resultado = await pool.query(consulta, valores);
        console.log(`Tarea [ ${titulo} ] insertada con éxito. El numero de filas afectadas es: ${resultado.rowCount}`)
        return resultado;

    }catch (error){
        console.error('Error al conectar o consultar la base de datos:', error);
        throw error;
    }
}

async function actualizarTarea(id, nuevoTitulo, nuevaDescripcion){
    const consulta = 'UPDATE tareas SET titulo = $1, descripcion = $2 WHERE id = $3';
    const valores = [nuevoTitulo, nuevaDescripcion, id];
    try {
        const resultado = await pool.query(consulta, valores);
        
        if(resultado.rowCount===0){
            console.log(`El ID ${id} no existe en la base de datos, no se actualizo naada!!`)
        }else{
            console.log(`Tarea con ID ${id} actualizada. Filas afectadas: ${resultado.rowCount}`)
            return resultado;
        }

    }catch (error){
        console.error('Error al conectar o consultar la base de datos:', error)
        throw error;
    }
}

async function eliminarTarea(idTarea) {
    const consulta = 'DELETE FROM tareas WHERE id = $1';
    const valores = [idTarea];
    try {
        const resultado = await pool.query(consulta, valores);
        if (resultado.rowCount === 0) {
            console.log(`No se encontró una tarea con el ID ${idTarea} para eliminar.`);
        } else {
            console.log(`Tarea con ID ${idTarea} eliminada. Filas afectadas: ${resultado.rowCount}`);
        }
        return resultado;
    } catch (error) {
        
    }
    
}
async function main() {
    insertarTarea("Dormir", "Dormirar Hasta tarde")
    actualizarTarea( 8, "nuevoTitulo", "nuevaDescripcion")
    eliminarTarea(1);
}
main();


//      