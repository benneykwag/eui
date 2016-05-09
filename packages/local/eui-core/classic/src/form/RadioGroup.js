Ext.define('eui.form.RadioGroup', {
    extend: 'Ext.form.RadioGroup',
    xtype: 'euiradiogroup',
    mixins: [
        'eui.mixin.FormField'
    ],

    initComponent: function () {
        this.setCheckboxGroupRadioGroupBindVar();
        this.callParent(arguments);
    }
});