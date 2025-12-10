require('dotenv').config();
const mysql = require('mysql2/promise');

// Guardar la configuración para poder acceder después
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arconorte',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
    console.log('Ayuda');
    let connection;
    try {
        // / Obtener una conexión del pool
        connection = await pool.getConnection();

        // Hacer ping para verificar
        await connection.ping();
        console.log('✅ Conexión a la BD OK');
        console.log(`   Host: ${dbConfig.host}`);
        console.log(`   Puerto: ${dbConfig.port}`);
        console.log(`   Usuario: ${dbConfig.user}`);
        console.log(`   Base de datos: ${dbConfig.database}`);

        // Obtener versión de MySQL
        const [result] = await connection.query('SELECT VERSION() as version');
        console.log(`   Versión MySQL: ${result[0].version}`);
    } 
    catch (error) {
        console.error('❌ Error al conectar a la BD:', err.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('1. Verifica que MySQL esté instalado y corriendo');
        console.log('2. Comandos para Windows con XAMPP:');
        console.log('   - Abre XAMPP Control Panel');
        console.log('   - Haz clic en "Start" en MySQL');
        console.log('3. Credenciales por defecto de XAMPP:');
        console.log('   - Usuario: root');
        console.log('   - Password: (vacío)');
        console.log('4. Crea el archivo .env con:');
        console.log('   DB_HOST=localhost');
        console.log('   DB_PORT=3306');
        console.log('   DB_USER=root');
        console.log('   DB_PASSWORD=');
        console.log('   DB_NAME=arconorte');
    }
    finally {
        // Liberar la conexión de vuelta al pool
        if (connection) connection.release();
    }
  
}

// testConnection();
// Ejecutar la prueba
testConnection().then(() => {
  console.log('\n🔍 Prueba completada');
});

module.exports = {
  pool,
  query: (sql, params = []) => pool.query(sql, params),
  execute: (sql, params = []) => pool.execute(sql, params),
  getConnection: () => pool.getConnection(),
};