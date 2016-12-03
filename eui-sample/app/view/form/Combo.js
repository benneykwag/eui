Ext.define('Eui.sample.view.form.Combo',{
    extend: 'Ext.panel.Panel',
    xtype: 'sample-combo',
    title : 'Combo',
    defaults: {
        margin: 5
    },
    items: [
        {
            xtype: 'euiform',
            title: '단일 콤보',
            items: [
                {
                    fieldLabel: '콤보박스 TYPE2',
                    xtype: 'euicombo',
                    proxyUrl : 'resources/data/companys.json',
//                    proxyUrl : 'companys.do',
                    displayField: 'name',
                    valueField: 'code',
                    groupCode: 'A001',
                    value: 'MICROSOFT',
                    bind: '{RECORD.COMBOBOX02}'
                },
                {
                    groupCode: 'A001',
                    value: 'MICROSOFT',
                    xtype: 'companycombo'
                }
            ]
        }
    ]
})