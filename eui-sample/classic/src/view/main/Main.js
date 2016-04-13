/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Eui.sample.view.main.Main', {
    extend: 'Ext.Container',
    xtype: 'app-main',
    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',
        'Eui.sample.view.main.MainController',
        'Eui.sample.view.main.MainModel',
        'Eui.sample.view.main.List'
    ],

    controller: 'main',
    viewModel: {
        type:'main'
    },
    layout: 'border',
    items: [
        {
            title: 'Menu#{행추가}',
            region: 'west',
            xtype: 'leftmenu',
            margin: '5 0 0 5',
            width: 200,
            collapsible: true, // make collapsible
            itemId: 'west-region-container',
            split: true,
            layout: 'fit'
        },
        {
            title: 'Main View',
            region: 'center', // center region is required, no width/height
            // specified
            xtype: 'tabpanel',
            itemId: 'maintab',
            layout: 'fit',
            margin: '5 5 0 0',
            items: [
                {
                    xtype: 'sample-basic-grid'
                }
            ]
        }
    ]
});
