Ext.define('Eui.sample.view.template.tmp008.TMP008V03', {
    extend: 'eui.grid.Panel',
    xtype: 'TMP008V03',
    title: '보증정보',

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
        },
        {
            xtype: 'widgetcolumn',
            text: '증권조회',
            align: 'center',
            width: 60,
            dataIndex: 'field2',
            widget: {
                xtype: 'button',
                bind: {
                    text: '조회'
                },
                handler: 'onButtonClick'
            }
        }
    ]

});