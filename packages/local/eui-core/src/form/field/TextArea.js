/***
 *
 * ## Summary
 *
 * Ext.form.field.TextArea 확장. 스타일 적용
 *
 **/
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