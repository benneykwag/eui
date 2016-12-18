Ext.define('Override.grid.column.Column', {
    override: 'Ext.grid.column.Column',
    localeProperties: ['text'],
    style: 'text-align:center',
    initComponent: function () {
        this.callParent(arguments);
    }
});