Ext.define('Calendar.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.app-main',

    requires: [
        'Calendar.store.Google',
        'Calendar.store.Remote',
        'Calendar.util.Google',
        'Calendar.util.Remote'
    ]
});
