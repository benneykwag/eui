Ext.define('Override.grid.column.Column', {
    override: 'Ext.grid.column.Column',
    localeProperties: ['text'],
    initComponent: function () {
        this.callParent(arguments);
    }
});