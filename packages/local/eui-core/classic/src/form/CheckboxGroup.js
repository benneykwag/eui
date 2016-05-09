Ext.define('eui.form.CheckboxGroup', {
    extend: 'Ext.form.CheckboxGroup',
    xtype: 'euicheckboxgroup',
    mixins: [
        'eui.mixin.FormField'
    ],

    initComponent: function () {
        this.setCheckboxGroupRadioGroupBindVar();

        this.callParent(arguments);
    }
});