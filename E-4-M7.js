const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_USUARIOS,
});

async function realizarTransferencia(cuentaOrigenId, cuentaDestinoId, monto) {
  const client = await pool.connect();
  try {
        await client.query("BEGIN"); /////////////////////////////////////////////////
        //Resta el saldo de la cuenta de origen. 
        const updateCuentaOrigen = "UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2 ";
        const parametrosCuentaOrigen = [monto, cuentaOrigenId];
        await client.query(updateCuentaOrigen,parametrosCuentaOrigen);
        console.log(`Saldo de la cuenta #${cuentaOrigenId} actualizado.`);// este console log me sirvio para ver que funciona el rollback porque
        //pase un parametro invalido [ realizarTransferencia(3, "x", 100);] e hizo la resta inicial de la cuenta origen pero despues al ir actualizar la cuenta destino
        // no pudo porque era una X que es un parametro invalido

        
        //Suma el saldo de la cuenta de destino.
        const updateCuentaDestino = "UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2";
        const parametrosCuentaDestino = [monto, cuentaDestinoId];
        await client.query(updateCuentaDestino, parametrosCuentaDestino);
        await client.query("COMMIT"); /////////////////////////////////////////////////
        console.log(`Saldo de la cuenta #${cuentaDestinoId} actualizado.`);
        client.release();
        return;
  } catch (error) {
    await client.query("ROLLBACK"); /////////////////////////////////////////////////
    console.log("se hizo rollback porque hubo un error: "+error.message);
    client.release();
    return;
  }
}

realizarTransferencia(3, 1, 100)

//origen-destino-monto
