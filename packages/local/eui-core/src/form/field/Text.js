/***
 *
 * ## Summary
 *
 * Ext.form.field.Text 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.field.Text', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.euitext',
    cellCls: 'fo-table-row-td',
    width: '100%',
    fieldStyle: {
        display: 'inherit'
    }
});