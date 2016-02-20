Ext.define('eui.form.field.Text', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.sptext',

    cellCls: 'fo-table-row-td',
    width: '100%',
    hideLabel: true,
    fieldStyle: {
        display: 'inherit'
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});