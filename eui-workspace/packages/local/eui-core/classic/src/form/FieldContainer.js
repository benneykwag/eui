Ext.define('eui.form.FieldContainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.spfieldcontainer',

    cellCls: 'fo-table-row-td',
    width: '100%',
    layout: 'column',
    defaults: {
        width: '50%'
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});