Ext.define('eui.form.RadioGroup', {
    extend: 'Ext.form.RadioGroup',
    xtype: 'euiradiogroup',

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