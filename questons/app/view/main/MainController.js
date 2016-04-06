/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Questions.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',
    requires: ['wizard.view.wizard.Wizard'],
    onItemSelected: function (sender, record) {
        this.wizard = Ext.create('Ext.Window', {
            // header: false,
            modal: true,
            layout: 'fit',
            autoShow: true,
            resizable: false,
            width: 500,
            height: 500,
            items: [
                {
                    xtype: 'wizard'
                }
            ]
        });
        this.getView().add(this.wizard);
        this.wizard.down('wizard').load(1);
    },

    onConfirm: function (choice) {
        if (choice === 'yes') {
            //
        }
    }
});
