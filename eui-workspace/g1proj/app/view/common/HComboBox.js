Ext.define('g1.view.common.HComboBox', {
    extend: 'eui.form.field.ComboBox',
    xtype:'hcombobox',
    proxyType: 'rest',
//    editable: true,
    proxyUrl : '/api/COM050101SVC/getCode',
    cellCls: 'fo-table-row-td',
    displayField: 'CUSTOMER_NAME_ENG',
    valueField: 'CUSTOMER_CODE'
});