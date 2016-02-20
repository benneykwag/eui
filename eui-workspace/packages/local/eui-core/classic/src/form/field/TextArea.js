Ext.define('eui.form.field.TextArea', {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.sptextarea',

    cellCls: 'fo-table-row-td',
    width: '100%',
    hideLabel: true,
    fieldStyle: {
        display: 'inherit'
    },
    height: 70,
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});