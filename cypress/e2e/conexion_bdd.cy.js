///<reference types="cypress"/>

describe('data base', () => { 
    let nombreAdmin, claveAdmin, nombreCajero, claveCajero, cedulaCliente, nombreCliente, tlfCliente, emailCliente; // Declara las variables fuera de los tests

    it.only('OBTENCION DE USARIO ADMINISTRADOR', () => {
        cy.task("queryDB","select top 1 usr_usuario, urs_varchar1 from users_pos where usr_usuario like '%adminqa%'").then(res => {
            var rec=res;
            const results = Object.values(rec[0]);
            nombreAdmin = results[0]; // Guarda el valor de cédula en la variable
            claveAdmin = results[1]; // Guarda el valor de nombre en la variable
            cy.log('Administrador: ');
            cy.log('Nombre '+nombreAdmin);
            cy.log('Clave: '+claveAdmin);
            
            // Write the variables to a JSON file
            cy.writeFile('cypress/fixtures/datosAdmin.json', { nombreAdmin, claveAdmin });
            cy.log('OBTENCION DE DATOS DE ADMINISTRADOR EXITOSA DESDE BDD!');
        });

        cy.task("queryDB","select top 1 usr_usuario, urs_varchar1 from users_pos where usr_usuario like '%cajeroqa%'").then(res=> {
            var rec=res;
            const results = Object.values(rec[0]);
            nombreCajero = results[0];
            claveCajero = results[1];
            cy.log('Cajero: ');
            cy.log('Nombre '+nombreCajero);
            cy.log('Clave: '+claveCajero);
            
            // Write the variables to a JSON file
            cy.writeFile('cypress/fixtures/datosCajero.json', { nombreCajero, claveCajero });
            cy.log('OBTENCION DE DATOS DE CAJERO EXITOSA DESDE BDD!');
        })

        cy.task("queryDB","SELECT TOP 1 cli_documento, cli_nombres, cli_telefono, cli_email FROM Cliente TABLESAMPLE(15 PERCENT) WHERE IDTipoDocumento = (SELECT IDTipoDocumento FROM Tipo_Documento WHERE tpdoc_descripcion = 'CEDULA') AND cli_telefono != '';").then(res=> {
            var rec=res;
            const results = Object.values(rec[0]);
            cedulaCliente = results[0];
            nombreCliente = results[1];
            tlfCliente = results[2];
            emailCliente = results[3];
            cy.log('Cliente: ');
            cy.log('Cedula: '+cedulaCliente);
            cy.log('Nombre: '+nombreCliente);
            cy.log('Tlf: '+tlfCliente);
            cy.log('E-mail: '+emailCliente);
            
            // Write the variables to a JSON file
            cy.writeFile('cypress/fixtures/datosCliente.json', { cedulaCliente, nombreCliente, tlfCliente, emailCliente });
            cy.log('OBTENCION DE DATOS DE CAJERO EXITOSA DESDE BDD!');
        })
    });
})
