///Codigos de la materia en modulo 7

const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // Paquete para hashear contraseñas
const pool = new Pool({ /* ... configuración ... */ });

async function crearUsuario(nombre, email, password) {
    // Para cualquier operación de escritura, es mejor obtener un cliente dedicado.
    const client = await pool.connect();
    try {
        // La consulta SQL con marcadores de posición y la cláusula RETURNING
        const sql = `
            INSERT INTO usuarios (nombre, email, password_hash) 
            VALUES ($1, $2, $3) 
            RETURNING id, nombre, email, fecha_registro
        `;
        
        // El "costo" del hasheo, 10 es un buen valor estándar.
        // Un costo mayor es más seguro pero más lento.
        const saltRounds = 10;
        // NUNCA guardes contraseñas en texto plano. Siempre usa un algoritmo de hash robusto.
        // bcrypt genera un "salt" aleatorio y lo incorpora al hash, haciéndolo seguro contra ataques de rainbow tables.
        const passwordHash = await bcrypt.hash(password, saltRounds); 
        
        const values = [nombre, email, passwordHash];

        const result = await client.query(sql, values);
        
        // result.rowCount nos dirá cuántos registros se insertaron (debería ser 1)
        console.log(`Registros insertados: ${result.rowCount}`);

        if (result.rowCount > 0) {
            const nuevoUsuario = result.rows[0];
            console.log('Usuario creado exitosamente:');
            console.table(nuevoUsuario);
            return nuevoUsuario;
        }
        
        return null;

    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error; // Propagamos el error para que la capa superior (ej. la ruta de Express) lo maneje.
    } finally {
        // Es crucial liberar al cliente para que vuelva al pool.
        client.release();
    }
}

// Uso de la función
// crearUsuario('Carlos', 'carlos@correo.com', 'secreto123');

//==========================================================================================================//

async function actualizarEmailUsuario(idUsuario, nuevoEmail) {
    const client = await pool.connect();
    try {
        // Usamos NOW() de PostgreSQL para la fecha, asegurando consistencia.
        const sql = `
            UPDATE usuarios 
            SET email = $1, fecha_actualizacion = NOW() 
            WHERE id = $2
            RETURNING *
        `;
        const values = [nuevoEmail, idUsuario];

        const result = await client.query(sql, values);

        // result.rowCount nos dice cuántos registros fueron afectados.
        console.log(`Registros actualizados: ${result.rowCount}`);

        if (result.rowCount > 0) {
            console.log('Usuario actualizado:');
            console.table(result.rows[0]);
            return result.rows[0];
        } else {
            // Esto es importante: si rowCount es 0, no es un error,
            // simplemente significa que no se encontró un usuario con ese ID.
            console.log('No se encontró ningún usuario con ese ID para actualizar.');
            return null;
        }

    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Uso
// actualizarEmailUsuario(1, 'carlos.nuevo@correo.com');


/// Ejemplo de Borrado de un Producto:

async function eliminarProducto(idProducto) {
    const client = await pool.connect();
    try {
        // Usar RETURNING en un DELETE es útil para logging o para deshacer.
        const sql = 'DELETE FROM productos WHERE id = $1 RETURNING nombre';
        const values = [idProducto];

        const result = await client.query(sql, values);

        // Obtenemos la cantidad de registros eliminados.
        console.log(`Registros eliminados: ${result.rowCount}`);
        
        if (result.rowCount > 0) {
            console.log(`Se eliminó el producto: ${result.rows[0].nombre}`);
            return true;
        }
        return false; // Devuelve true si se eliminó algo, false si no.

    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Uso
// eliminarProducto(5).then(eliminado => {
//     if (eliminado) {
//         console.log('El producto fue eliminado con éxito.');
//     } else {
//         console.log('No se encontró el producto para eliminar.');
//     }
// });