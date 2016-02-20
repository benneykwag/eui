/*
* checkbox의 값은 기본으로 'Y', 'N'으로 한다.
* getData()에서 return시 true, false를 return하는 것이 아니라, Y, N을 return한다.
* */
Ext.define('eui.form.field.Checkbox', {
    extend: 'Ext.form.field.Checkbox',
    alias: 'widget.spcheckbox',
    inputValue: 'Y',
    uncheckedValue: 'N',
    cellCls: 'fo-table-row-td',

    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },

    getValue: function () {
        return this.getSubmitValue();
    }
});