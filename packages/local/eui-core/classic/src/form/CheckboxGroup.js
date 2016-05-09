Ext.define('eui.form.CheckboxGroup', {
    extend: 'Ext.form.CheckboxGroup',
    xtype: 'euicheckboxgroup',
    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',
    initComponent: function () {
        this.setCheckboxGroupRadioGroupBindVar();
        this.setAllowBlank();
        this.callParent(arguments);
    }
});