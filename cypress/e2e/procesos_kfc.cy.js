///<reference types="cypress" />

//Al momento de fallar un assert, cypress se sigue ejecutando
Cypress.on('uncaught:exception', (err, runnable) => {
    // Devuelve false para evitar que Cypress falle la prueba
    return false;
});

describe('Automatizacion de procesos de Maxpoint', ()=> {
    let ipArray;
    let nombreAdmin, claveAdmin, nombreCajero, claveCajero; // Declare the variables outside the tests

    before(() => {
        // Read the variables from the JSON file
        cy.readFile('cypress/fixtures/datosAdmin.json').then(data => {
            nombreAdmin = data.nombreAdmin;
            claveAdmin = data.claveAdmin;
        });

        cy.readFile('cypress/fixtures/datosCajero.json').then(datos=> {
            nombreCajero = datos.nombreCajero;
            claveCajero = datos.claveCajero;
        })
    });
    
    //Inicio de Dia
    it('Inicio de dia', ()=> {
        cy.visit(Cypress.env('pos'));

        cy.xpath('//\*[@id="btn_iniciarPeriodo"]').wait(6000).then((iniciar)=> {
            if(iniciar.is(':visible')){
                cy.log('HAY QUE INICIAR SESION');
                cy.get('#btn_nombreCaja').wait(6000).should('contain', 'Iniciar Sesión').then(()=> {
                    cy.log('SEGUNDA VALIDACION PARA INICIAR SESION');

                    cy.get('#usr_clave').click().wait(1000).type(claveAdmin);
                    cy.get('#btn_iniciarPeriodo').click();

                    //SIGUIENTE PANTALLA
                    cy.xpath('//\*[@id="btn_guardar_periodo"]').should('be.visible').wait(1000).click();

                    //MODAL
                    cy.xpath('//\*[@id="alertify-ok"]').should('be.visible').wait(1000).click();

                    cy.log('PERIODO INCICIADO CON EXITO!');
                })
            }else{
                cy.log('NO ESTA VISIBLE. YA HAY PERIODO');
            }
        })

    });

    //Asignación de Cajero y fondo de caja
    //Validacion si ya estaba el cajero asignado o no
    //Validacion de fondo asignado
    it.only('Asignacion de cajero y fondo de caja', ()=> {
        cy.visit(Cypress.env('pos'));

        //asignar cajero en caso de NO tener cajero esa estacion
        cy.get('#Respuesta_Estacion').should('be.visible').invoke('text').then(($texto)=> {
            if($texto.includes('NO ASIGNADO')){
                cy.log("INGRESO ACA EL IF");
                cy.get('#usr_clave').click().wait(1000).type(claveCajero);
                cy.get('#validar').click();
                cy.get('.alertify-dialog').should('be.visible').invoke("text").then(($modal)=> {
                    if($modal.includes('El usuario ha ingresado al sistema')) {
                        cy.get('#alertify-ok').should("be.visible").click();
                        console.log("Asignacion de cajero exitoso!");
                    }
                })
                cy.get('.alertify-dialog').should("be.visible").then(($modal2)=> {
                    if($modal2.find('p:contains(Usted se encuentra en otro periodo. Está seguro que desea seguir facturando en el periodo:)').length > 0) {
                        cy.get('#alertify-ok').should("be.visible").click();
                        console.log("Asignacion de cajero exitoso!");
                    }
                });
                //permiso de administrador
                cy.get('#usr_claveAdmin').should("be.visible").click().wait(3000).type(claveAdmin);
                cy.get('#tabla_credencialesAdmin > tbody > :nth-child(3) > :nth-child(4) > .btnVirtualOKpq').click();
                //asignacion de fondo
                cy.get('#usr_admin_fondo').should("be.visible").wait(3000).click();
                cy.get('#tabla_credencialesAdminfondo > tbody > :nth-child(2) > :nth-child(2) > .btnVirtual').click();
                cy.get('#tabla_credencialesAdminfondo > tbody > :nth-child(4) > :nth-child(1) > .btnVirtual').click();
                cy.get('#tabla_credencialesAdminfondo > tbody > :nth-child(3) > :nth-child(4) > .btnVirtualOKpq').click();
                //confirmacion de monto de fondo asignado
                cy.get('.alertify-dialog').should("be.visible").then((confirmacionFondo)=> {
                    if(confirmacionFondo.find('p:contains(Está usted seguro/a que el fondo asignado de)')){
                        cy.get('#alertify-ok').click();
                    }
                })
                //OJO AQUI SE ROMPE LA ASIGNACION DE CAJERO, SE QUEDA EN EL MODAL DE ASIGNAR FONDO Y NO REACCIONA. POR ESO
                //LE COLOQUE EL RELOAD
                cy.reload().wait(6000);
                //PRIMER INICIO DE SESION Y CONFIRMACION DE FONDO:
                cy.get('#usr_clave').click().wait(1000).type(claveCajero);
                cy.get('#btn_ingresarOk').click();
                cy.get('.alertify-dialog').should("be.visible").then((confirmacionFondo)=> {
                    if(confirmacionFondo.find('p:contains(Está usted seguro/a que el fondo asignado de)')){
                        cy.get('#alertify-ok').click();
                    }
                })
                //cy.get('#alertify-ok').click();
            }else{
                //INICIO DE SESION EN CASO DE TENER EL CAJERO ASIGNADO
                console.log("INGRESO ACA EL ELSE");
                cy.get('#usr_clave').click().wait(1000).type(claveCajero);
                cy.get('#btn_ingresarOk').click();
                //confirmacion de monto de fondo asignado
                /*cy.get('.alertify-dialog').then((confirmacionFondo)=> {
                    if(confirmacionFondo.is(':visible')){
                        cy.get('#alertify-ok').click();
                    }else{
                        cy.log("Ya tiene fondo confirmado");
                    }
                })
                //validacion si se encuentra en otro periodo
                cy.get('.alertify-dialog').wait(3000).then((otroPeriodo)=> {
                    if(otroPeriodo.find('p:contains(Usted se encuentra en otro periodo. Está seguro que desea seguir facturando en el periodo:)').length > 0){
                        cy.get('#alertify-ok').click();
                    }else{
                        cy.log("logeo exitoso en periodo actual");
                    }
                })*/
            }
        })
    });

    //FACTURACIONES FASTFOOD
    it('Consumidor Final con Agregador', ()=> {

    });

    it('Cedula con descuento de factura en efectivo', ()=> {

    });

    it('RUC con crédito externo', ()=> {

    });

    it('Pasaporte con decuento de producto y pago con Tarjeta(DATAFAST)', ()=> {

    });

    //DESASIGNADO DE CAJERO
    it('Retiro de Valores (distintos métodos de pago)', ()=> {

    });

    it('Retiro de Fondo asignado', ()=> {

    });

    it('Desasignado de Cajero', ()=> {

    });
})