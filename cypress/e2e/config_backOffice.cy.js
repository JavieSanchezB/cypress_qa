///<reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
    // Devuelve false para evitar que Cypress falle la prueba
    return false;
});

//conjunto de configuraciones previas de preparacion del ambiente para comenzar las pruebas
describe('Configuracion del BackOffice', ()=> {
    let ipArray;
    let nombreAdmin, claveAdmin, ip1, ip2, ip3, ip4; // Declare the variables outside the tests

    before(() => {
        // Read the variables from the JSON file
        cy.readFile('cypress/fixtures/datosAdmin.json').then(data => {
            nombreAdmin = data.nombreAdmin;
            claveAdmin = data.claveAdmin;
        });
    });

    beforeEach(()=> {
        cy.readFile('cypress/fixtures/datosVPN.json').then((octetos) => {
            for (let index in octetos) {
                cy.log(index + " : " + octetos[index]);
                ip1 = octetos.ipArray[0];
                ip2 = octetos.ipArray[1];
                ip3 = octetos.ipArray[2];
                ip4 = octetos.ipArray[3];

            }
            cy.log(ip1);
            cy.log(ip2);
            cy.log(ip3);
            cy.log(ip4);
        });
    })

    //INGRESO AL BACKOFFICE COMO ADMIN, CONFIGURANDO POLITICAS QUE IMPIDEN EL ASIGNARSE UNA CAJA COMO CAJERO
    it('Logeo en BackOffice', ()=> {
        //URL A VISITAR (BackOffice)
        cy.visit(Cypress.env('backoffice'));

        //seleccionando el input administrador para tipear el nombre del admin
        cy.xpath('//\*[@id="txtUsuario"]')
            .click()
            .wait(1000)
            .clear()
            .type(nombreAdmin);
        
        //seleccionando el input password para tipear la contraseña del admin
        cy.xpath('//\*[@id="txtClave"]')
            .click()
            .wait(1000)
            .clear()
            .type(claveAdmin);

        //click en el botón "INGRESAR"
        cy.xpath('/html/body/strong/div/div/form/div[4]/input')
            .click()
            .wait(1000);

        //Logo de la tienda visible
        cy.xpath('/html/body/strong/div/div[1]/form/div[2]/div/img')
            .then(($logoDeTienda)=> {
                if($logoDeTienda.is(':visible')){
                    console.log('Logeo en BackOffice exitoso!');
                    cy.log('PASO 1 LOGEO EN BACKOFFICE EXITOSO!!!');
                }else{
                    cy.log('El logeo en tienda falló.');
                }
        })

        //CLick en el logo de la tienda
        cy.xpath('/html/body/strong/div/div[1]/form/div[2]/div/img')
            .click()
            .wait(2000);

        //Logo de tienda visible en panel de configuracion, ingreso esitoso!
        cy.xpath('/html/body/div[1]/div/ul[2]/li[1]/a/span/img')
            .wait(3000)
            .then(($logoDeTiendaEnPanel)=> {
                if($logoDeTiendaEnPanel.is(':visible')){
                    cy.log('PASO 2 INGRESO EXITOSO A LA CONFIGURACION DE LA TIENDA!!!')
                }
        })

        //Esta es una validacion para cuando el menu delbackoffice este colapsado
        //De estar colapsado dar click en el toggle-sidebar, de lo contrario, continuar
        cy.get('.collapse-sidebar').then(($menuColapsado) => {
            if($menuColapsado.is(':visible') || $menuColapsado.is(':enable')) {
                cy.get('.toggle-sidebar > a > .fa').click();
            }
        });


        //click en Menu "Restaurante"
        cy.get(':nth-child(3) > .notExpand > .txt')
            .should("be.visible")
            .click();

        //Click en sub-menu "Estacion"
        cy.get('#\\32 1059503-85CF-E511-80C6-000D3A3261F3 > a > .txt')
            .should("be.visible")
            .click();
        
        //Click en el select del Restaurante
        cy.get('.chosen-single > span').click();

        //Seleccionar el restaurante en el select desplegado
        cy.get('li[data-option-array-index="1"]').click();

        //De aqui en adelante el barrido de la tabla que contiene la informacion de cada una de las estaciones
        cy.get('[onclick="fn_OpcionSeleccionada(\'Todos\');"]').click();

        cy.get('#detalle_estacion')
            .find('tbody')
            .find('tr')
            .each(($tr) => {
                //Doble click en cada una de las estaciones para ingresar al modal de configuracion de cada una
                cy.wrap($tr).should("be.visible").dblclick();
                cy.get('#titulomodalModificar').should('be.visible').then(() => {
                    //click en la pestaña de politicas de configuracion de esa estacion
                    cy.get('#pestanasMod > :nth-child(3) > a').click();
                    cy.get('[onclick="fn_accionarPoliticas(\'Nuevo\', 1)"] > .glyphicon').should('be.visible');

                    //Ejecuta la iteracion sobre las politicas, buscando un campo dentro de la tabla con el valor "CONEXION REMOTA"
                    cy.get('#tbl_estacion_coleccion').then((body)=> {
                        //SI lo consigue...
                        if(body.find('tr:contains(CONEXION REMOTA)').length > 0 ){
                            //Le cambia el valor a esa politica, guarda los cambios y sigue iterando sobre las siguientes estaciones
                            cy.get('#tbl_estacion_coleccion').contains('CONEXION REMOTA').click();
                            cy.get('.col-xs-1 > .glyphicon').click();
                            cy.get('#txt_caracterM')
                                .wait(1000)
                                .click()
                                .wait(1000)
                                .clear("v")
                                .wait(2000)
                                .type('000');
                            cy.get('#mdl_editaColeccion > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
                        }
                    })

                });
                cy.get('#botonesguardarcancelarMod > .btn-default').contains('Cancelar', { timeout: 8000 }).should("be.visible").click();
                // Esperar a que el modal se cierre antes de continuar
                cy.get('#titulomodalModificar').should('not.be.visible');
            });
            
            //validacion para cuando hay mas de 1 pagina con estaciones
            cy.get('li.paginate_button.next')
                .then(($li) => {
                    //si el boton "Siguiente" NO está deshabilitado, da click sobre él, e itera las estaciones de la siguiente página.
                    //Hasta que consigue el boton "Siguiente" en "disabled". Alli finaliza la iteracion 
                    if (!$li.attr('disabled')) {
                        // Código a ejecutar si el atributo "disabled" no está presente
                        cy.get('#detalle_estacion_next > a').click();

                        cy.get('#detalle_estacion')
                        .find('tbody')
                        .find('tr')
                        .each(($tr) => {
                            // Hacer doble clic en el td
                            cy.wrap($tr).should("be.visible").dblclick();
                            cy.get('#titulomodalModificar').should('be.visible').then(() => {
                                cy.get('#pestanasMod > :nth-child(3) > a').click();
                                cy.get('[onclick="fn_accionarPoliticas(\'Nuevo\', 1)"] > .glyphicon').should('be.visible');

                                cy.get('#tbl_estacion_coleccion').then((body)=> {
                                    if(body.find('tr:contains(CONEXION REMOTA)').length > 0 ){
                                        cy.get('#tbl_estacion_coleccion').contains('CONEXION REMOTA').click();
                                        cy.get('.col-xs-1 > .glyphicon').click();
                                        cy.get('#txt_caracterM')
                                            .wait(1000)
                                            .click()
                                            .wait(1000)
                                            .clear("v")
                                            .wait(2000)
                                            .type('000');
                                        cy.get('#mdl_editaColeccion > .modal-dialog > .modal-content > .modal-footer > .btn-primary').click();
                                    }
                                })

                            });
                            cy.get('#botonesguardarcancelarMod > .btn-default').contains('Cancelar', { timeout: 8000 }).should("be.visible").click();
                            // Esperar a que el modal se cierre antes de continuar
                            cy.get('#titulomodalModificar').should('not.be.visible');
                        });
                    }
                });
    })

    //TEST PARA OBTENER IP DE MI VPN
    it('Obtencion de mi IP para asignarme estacion', ()=> {
        //URL a la que voy a ingresar
        cy.visit(Cypress.env('pos'));

        //
        cy.xpath('//\*[@id="btn_nombreCaja"]')
            .wait(3000)
            .should("be.visible")
            .click()
        
        cy.get('#ipestacion')
            .wait(1000)
            .should("be.visible")
            .invoke("val")
            .then((ipEstacion)=> {
                const miIP = ipEstacion;

                ipArray = miIP.split('.');
                console.log(ipArray);
                cy.log('OBTENCION DE IP EXITOSA: mi IP: '+ ipArray);
                cy.writeFile('cypress/fixtures/datosVPN.json', { ipArray });
            })
    })    
    
    //TEST PARA ASIGNAR ESTACIÓN
    it('Asignacion de Cajero', ()=> {
        //URL A VISITAR (BackOffice)
        cy.visit(Cypress.env('backoffice'));

        //seleccionando el input administrador para tipear el nombre del admin
        cy.xpath('//\*[@id="txtUsuario"]')
            .click()
            .wait(1000)
            .clear()
            .type(nombreAdmin);
        
        //seleccionando el input password para tipear la contraseña del admin
        cy.xpath('//\*[@id="txtClave"]')
            .click()
            .wait(1000)
            .clear()
            .type(claveAdmin);

        //click en el botón "INGRESAR"
        cy.xpath('/html/body/strong/div/div/form/div[4]/input')
            .click()
            .wait(1000);

        //Logo de la tienda visible
        cy.xpath('/html/body/strong/div/div[1]/form/div[2]/div/img')
            .then(($logoDeTienda)=> {
                if($logoDeTienda.is(':visible')){
                    console.log('Logeo en BackOffice exitoso!');
                    cy.log('PASO 1 LOGEO EN BACKOFFICE EXITOSO!!!');
                }else{
                    cy.log('El logeo en tienda falló.');
                }
        })

        //CLick en el logo de la tienda
        cy.xpath('/html/body/strong/div/div[1]/form/div[2]/div/img')
            .click()
            .wait(2000);

        //Logo de tienda visible en panel de configuracion, ingreso esitoso!
        cy.xpath('/html/body/div[1]/div/ul[2]/li[1]/a/span/img')
            .wait(3000)
            .then(($logoDeTiendaEnPanel)=> {
                if($logoDeTiendaEnPanel.is(':visible')){
                    cy.log('PASO 2 INGRESO EXITOSO A LA CONFIGURACION DE LA TIENDA!!!')
                }
        })

        //Esta es una validacion para cuando el menu delbackoffice este colapsado
        //De estar colapsado dar click en el toggle-sidebar, de lo contrario, continuar
        cy.get('.collapse-sidebar').then(($menuColapsado) => {
            if($menuColapsado.is(':visible') || $menuColapsado.is(':enable')) {
                cy.get('.toggle-sidebar > a > .fa').click();
            }
        });


        //click en Menu "Restaurante"
        cy.get(':nth-child(3) > .notExpand > .txt').should("be.visible").click();

        //Click en sub-menu "Estacion"
        cy.get('#\\32 1059503-85CF-E511-80C6-000D3A3261F3 > a > .txt').should("be.visible").click();
        
        //Click en el select del Restaurante
        cy.get('.chosen-single > span').click();

        //Seleccionar el restaurante en el select desplegado
        cy.get('li[data-option-array-index="1"]').click();

        //Ordenar las estaciones por nombre(Estacion 01, 011, 012... 02, 021...)
        cy.xpath('/html/body/div[2]/div/div/div/div/div[2]/div/div[3]/div/div[2]/div/table/thead/tr/th[2]').should('be.visible').wait(1000).click();
        
        //Seteo la caja02 para configurarle y asignarmela
        cy.get('tr:contains(CAJA02)').dblclick().wait(1000);

        cy.get('#ipM1').clear("1").wait(1000).type(ip1); //Tipeo del primer octeto de mi vpn en el primer campo de ip de estacion con ID:'ipM1'
        cy.get('#ipM2').clear("1").wait(1000).type(ip2); //Tipeo del segundo octeto de mi vpn en el primer campo de ip de estacion con ID:'ipM2'
        cy.get('#ipM3').clear("1").wait(1000).type(ip3); //Tipeo del tercer octeto de mi vpn en el primer campo de ip de estacion con ID:'ipM3'
        cy.get('#ipM4').clear("1").wait(1000).type(ip4); //Tipeo del cuarto octeto de mi vpn en el primer campo de ip de estacion con ID:'ipM4'
        cy.log("Caja asignada");

        //Click en configuracion de politticas de la estacion
        cy.get('#pestanasMod > :nth-child(3) > a').click();
        //Validacion que verifica si el apartado de politicas YA esta visible en la pantalla para continuar con el resto de procesos
        cy.get('[onclick="fn_accionarPoliticas(\'Nuevo\', 1)"] > .glyphicon').should('be.visible');

        //Iteracion sobre las politicas de la estacion, buscando la politica "ESTACION TOMA PEDIDO"
        //Esto para desactivarla en caso de que se encuentre activa, ya que esta politica me impide asignarme una estacion para facturar
        cy.get('#tbl_estacion_coleccion').then((body)=> {
            //SI se encuentra la politica configurada en esta estacion...
            if(body.find('tr:contains(ESTACION TOMA PEDIDO)').length > 0 ){
                //...da click sobre ella...
                cy.get('#tbl_estacion_coleccion').contains('ESTACION TOMA PEDIDO').click();
                //...click sobre el icono "editar politica"...
                cy.get('.col-xs-1 > .glyphicon').click();
                //...validacion del campo check "Esta Activo?"
                cy.get('#check_activo').then((check)=> {
                    //... si el "check" es True...
                    if(check.is(':checked')){
                        //...cambialo a False (quitale el check al campo)
                        cy.get('#check_activo').click({force:true});
                    }
                })
                //click en boton "Guardar"
                cy.get('#mdl_editaColeccion > .modal-dialog > .modal-content > .modal-footer > .btn-primary').wait(2000).click();
            }//De lo contrario, no ejecuta ninguna accion
        });
        
        //Cerrado el modal de la politica "ESTACION TOMA PEDIDO"
        //click en boton "Aceptar", del modal de configuracion de estacion
        cy.get('#botonesguardarcancelarMod > .btn-primary').should('be.visible').wait(1000).click();
        cy.log('Configuracion de estacion completa!');
    })

    //TEST PARA VERIFICAR SI LA ESTACIÓN SE ASIGNÓ CORRECTAMENTE
    it('Verificacion de Estacion asignada', ()=> {
        //URL a la que voy a ingresar
        cy.visit(Cypress.env('pos'));
    })
})