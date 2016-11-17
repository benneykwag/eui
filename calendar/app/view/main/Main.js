Ext.define('Calendar.view.main.Main', {
    extend: 'Ext.Container',
    xtype: 'app-main',

    controller: 'app-main',
    viewModel: 'app-main',

    layout: 'fit',

    items: [
        {
            xtype: 'app-calendar'
        }
    ]
});
