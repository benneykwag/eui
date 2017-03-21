Ext.define('Eui.sample.view.common.HComboBox', {
    extend: 'eui.form.field.ComboBox_N',
    xtype:'hcombobox',

    proxyUrl : 'resources/data/getCode.json',
    displayField: 'CUSTOMER_NAME_ENG',
    valueField: 'CUSTOMER_CODE'
});