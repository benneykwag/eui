Ext.define('eui.form.field.Radio', {
    extend: 'Ext.form.field.Radio',
    alias: 'widget.spradio',

    cellCls: 'fo-table-row-td',

    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },

    getValue: function () {
        return this.getSubmitValue();
    }
});