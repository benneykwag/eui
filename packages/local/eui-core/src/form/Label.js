/***
 *
 * ## Summary
 *
 * Ext.form.FieldContainer 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.Label', {
    extend: 'Ext.form.Label',
    alias: 'widget.euilabel',
    cellCls: 'fo-table-row-th',
    allowBlank : true,
    localeProperties: ['html', 'text'],
    initComponent: function () {
        var me = this;
        if(me.allowBlank===false){
            Ext.apply(me, {
                cls: 'fo-required'
            });
        }
        me.callParent(arguments);
    }
});