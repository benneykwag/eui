Ext.define('Override.window.Window', {
    override: 'Ext.window.Window',
    localeProperties: ['title'],
    initComponent: function () {
        this.callParent(arguments);
    }
});