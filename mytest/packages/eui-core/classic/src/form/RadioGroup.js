Ext.define('eui.form.RadioGroup', {
    extend: 'Ext.form.RadioGroup',
    xtype: 'euiradiogroup',

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