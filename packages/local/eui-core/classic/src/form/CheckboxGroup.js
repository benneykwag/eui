Ext.define('eui.form.CheckboxGroup', {
    extend: 'Ext.form.CheckboxGroup',
    xtype: 'euicheckboxgroup',
    mixins: [
        'eui.mixin.FormField'
    ],
    hideLabel: true,
    cellCls: 'fo-table-row-td',
    width: '100%',
    initComponent: function () {
        this.setCheckboxGroupRadioGroupBindVar();

        this.callParent(arguments);
    }
});