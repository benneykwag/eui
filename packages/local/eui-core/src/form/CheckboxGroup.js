/***
 *
 * ## Summary
 *
 * Ext.form.CheckboxGroup 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.CheckboxGroup', {
    extend: 'Ext.form.CheckboxGroup',
    xtype: 'euicheckboxgroup',
    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',
    defaultListenerScope: true,
    listeners: {
        afterrender: 'setCheckboxGroupRadioGroupBindVar'
    },
    initComponent: function () {
        this.setAllowBlank();
        this.callParent(arguments);
    }
});