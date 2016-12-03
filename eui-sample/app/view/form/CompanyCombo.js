Ext.define('Eui.sample.view.form.CompanyCombo', {
    extend: 'eui.form.field.ComboBox',
    xtype: 'companycombo',
    displayField: 'name',
    valueField: 'code',
    editable: false,
    emptyText: '선택하세요',
    store: {
        proxy: {
            type: 'ajax',
            url: 'resources/data/companys.json',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        },
        fields: [
        ]
    }
});