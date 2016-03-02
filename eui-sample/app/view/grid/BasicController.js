/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Eui.sample.view.grid.BasicController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.sample-basic-grid',

    init: function () {

    },

    onRowAdd: function (grid) {
        grid.onRowAdd(grid, {
            randomInt : Ext.Number.randomInt(1, 1000000000000),
            CUSTOMER_NAME_ENG: 'SDS',
            CUSTOMER_NAME_KO: 'SDS'
        }, 0, function () {    // callback이 필요할 경우 구현한다.
            console.log('그리드 내부에서 콜백철...')
        });
    }
});
