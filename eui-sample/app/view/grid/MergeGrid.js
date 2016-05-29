/***
 * 농장경영성과 분석- 월별
 */
Ext.define('Eui.sample.view.grid.MergeGrid', {
    extend: 'eui.grid.Merge',
    xtype: 'sample-mergegrid',
    requires: [
        'eui.grid.column.Number'
    ],
    title: 'Rowspan, Colspan Grid',
    frame: true,
    store: {
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: 'resources/data/statdata1.json',
            reader: {
                type: 'json',
                rootProperty: 'data'
            },
            writer: {
                type: 'json',
                allowSingle: false,  // #2
                writeAllFields: true    // #3
            }
        },
        model: 'Eui.sample.model.Base',
        sorters: [
            'col3'
        ]
    },

    groupFields: [
        {
            field: 'col1',
            mergeConfig: [
                {
                    field: 'col2',
                    cond: 'colspan',
                    value: 2
                },
                {
                    field: 'col3',
                    cond: 'hidden',
                    value: true
                }
            ]
        },
        {
            field: 'col2',
            mergeConfig: []
        }
    ],
    lastMergeColumn: ['col3'],
    sumFields: ['col4', 'col5'],

    columns: [
        {
            text: '구분',
            columns: [
                {
//                    width: 100,
                    text: "수입/지출",
                    dataIndex: 'col1',
                    renderer: function (v) {
                        if(v == '합'){
                            return '총계'
                        }
                        return v;
                    }
                },
                {
//                    width: 200,
                    text: "대항목",
                    dataIndex: 'col2',
                    renderer: function (v) {
                        var value = v.split('@')[1];
                        if(value == '합'){
                            return '합계'
                        }
                        return value;
                    }
                },
                {
                    text: "소항목",
                    dataIndex: 'col3',
                    renderer: function (v) {
                        var value = v.split('@')[2];
                        if(value == '합'){
                            return '소계'
                        }
                        return value;
                    }
                }
            ]
        },

        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "1월",
            dataIndex: 'col4'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "2월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "3월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "4월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "5월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "6월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "7월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "8월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "9월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "10월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "11월",
            dataIndex: 'col5'
        },
        {
            width: 100,
            xtype: 'euinumbercolumn',
            text: "12월",
            dataIndex: 'col5'
        }
    ]
});