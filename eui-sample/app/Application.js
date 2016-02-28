/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Eui.sample.Application', {
    extend: 'Ext.app.Application',
    requires: [
    ],
    name: 'Eui.sample',

    stores: [
    ],


    launch: function () {
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application wwUpdate', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
