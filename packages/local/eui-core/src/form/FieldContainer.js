/***
 *
 * ## Summary
 *
 * Ext.form.FieldContainer 확장. 스타일 적용
 * 기본 item사이즈 적용
 *
 **/
Ext.define('eui.form.FieldContainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.euifieldcontainer',

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