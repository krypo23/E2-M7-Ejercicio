const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function obetenerUsuarios (){
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL_USUARIOS
    });
    try {
        await pool.connect();
        const resultado = await pool.query('SELECT * FROM usuarios');
        console.table(resultado.rows);
        return resultado.rows;
   
    } catch (error) {
        console.error('Error al conectar o consultar la base de datos:', error);
    } 
    await pool.end();
}

async function obtenerUsuarioPorEmail (email) { 
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL_USUARIOS
    });
    try {
        await pool.connect();
        const consulta = 'SELECT * FROM usuarios WHERE email = $1';
        const valores = [email];
        const resultado = await pool.query(consulta, valores);

        if(resultado.rows.length > 0){
            console.table(resultado.rows);
        }else{
            console.table("No se encontro el usuario con el email:" +email);
        }
    
    
    }catch{
        console.error('Error al conectar o consultar la base de datos:', error);

    }
        
}
obetenerUsuarios();
obtenerUsuarioPorEmail("luis.fernandez@example.com");
obtenerUsuarioPorEmail("noexiste@example.com");