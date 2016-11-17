/***
 *
 * ## Summary
 *
 * Ext.form.field.Radio 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.field.Radio', {
    extend: 'Ext.form.field.Radio',
    alias: 'widget.euiradio',

    cellCls: 'fo-table-row-td',

    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },

    getValue: function () {
        return this.getSubmitValue();
    }
});