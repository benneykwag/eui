Ext.define('Eui.sample.view.template.tmp008.TMP008V01', {
    extend: 'eui.grid.Panel',
    xtype: 'TMP008V01',
    title: 'MASTER',
    tbar: [
        '->',
        {
            reference: 'CODE_NAME',
            xtype: 'euitext',
            width: 100,
            emptyText: '입력',
            margin: '0 5'
        },
        {
            iconCls: 'fa fa-search',
            xtype: 'euibutton',
            handler: 'onSearch',
            text: '검색'
        }
    ],

    columns: [
        {
            xtype: 'rownumberer'
        },
        {
            width: 60,
            align: 'center',
            text: '현장코드',
            dataIndex: 'field1'
        },
        {
            flex: 1,
            text: '현장명',
            dataIndex: 'field2'
        }
    ]

});