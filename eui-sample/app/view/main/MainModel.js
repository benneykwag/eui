/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Eui.sample.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.main',

    stores: {
        shortcuts: {
            fields: [
                { name: 'name' },
                { name: 'iconCls' },
                { name: 'module' },
                'CHILD_YN',
                'CLS',
                'CODE',
                'DSKT_CD',
                'DSKT_SQ',
                'HEIGHT',
                'ICONCLS',
                'ID',
                'LEVEL',
                'MAXIMIZABLE',
                'ORDER_SEQ',
                'PCODE',
                'RESIZABLE',
                'SCLASS',
                'SHOTCUT',
                'SWIDGET',
                'TEXT',
                'WIDTH'
            ]
        }
    }
});
