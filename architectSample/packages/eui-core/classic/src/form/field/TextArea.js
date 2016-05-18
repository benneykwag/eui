Ext.define('eui.form.field.TextArea', {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.euitextarea',

    cellCls: 'fo-table-row-td',
    width: '100%',

    height: 100,
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});