const { defineConfig } = require("cypress");
const mssql = require("mssql");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        queryDB: (query) => {
          return queryTestDb(query, config);
        }
      });
    },
    "env": {
      "db": {
        "server": "192.168.101.42",
        "user": "sa",
        "password": "jcjajplae*88",
        "database": "MAXPOINT_K043",
        "port": 1433, // Puerto predeterminado para SQL Server
        "options": {
          instanceName: 'sqlexpress', // Nombre de la instancia SQL Server
          encrypt: true, // Establece si la conexión está cifrada
          trustServerCertificate: true // Desactiva la validación del certificado
        }
      }
    }
  },
  integration: {
    setupNodeEvents(on, config) {
      // Implementar los event listeners de nodo aquí
    },
  },
});

function queryTestDb(query, config) {
  const connection = new mssql.ConnectionPool(config.env.db);
  return new Promise((resolve, reject) => {
    connection.connect().then(pool => {
      return pool.request().query(query);
    }).then(result => {
      connection.close();
      resolve(result.recordset);
    }).catch(err => {
      reject(err);
    });
  });
}