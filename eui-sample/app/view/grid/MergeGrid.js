/***
 *
 */
Ext.define('Eui.sample.view.grid.MergeGrid', {
    extend: 'eui.grid.Merge',
    xtype: 'sample-mergegrid',
    requires: [
        'eui.grid.column.Number'
    ],
    title: 'Rowspan, Colspan Grid',
    frame: true,

    addSumRows: true,
    addTotalRow: true,

    viewModel: {
        stores: {
            store: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: 'resources/data/statdata1.json',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                fields: [
                    // 정의하지 않을 경우 model.getDate() 시 eui.Config.modelGetDataDateFormat 으로 전송.
                    /*  {
                     name: 'MONTHFIELD',
                     type: 'date',
                     dateFormat: "Y.m"
                     },
                     {
                     name: 'DATEFIELD',
                     type: 'date',
                     dateFormat: "Y.m.d"
                     },*/
                    {
                        name: "MSG_ID",
                        type: "string",
                        validators: [
                            {
                                type: "length",
                                min: 10,
                                minOnlyMessage: "MSG_ID must have at least 3 characters"
                            }
                        ]
                    },
                    {
                        name: "MSG_LABEL",
                        type: "string",
                        validators: [
                            {
                                type: "length",
                                min: 4,
                                minOnlyMessage: "MSG_LABEL must have at least 3 characters"
                            }
                        ]
                    },
                    {
                        name: "col1",
                        type: "string"
                    },
                    {
                        name: "col2",
                        type: "string",
                        convert: function (v, record) {
                            return record.get('col1')+'@'+record.get('col2');
                        }
                    },
                    {
                        name: "col3",
                        type: "string",
                        convert: function (v, record) {
                            return record.get('col2')+'@'+record.get('col3');
                        }
                    },
                    {
                        name: "col6",
                        type: "string",
                        convert: function (v, record) {
                            return record.get('col1')+'@'+record.get('col2')+'@'+record.get('col3')+'@'+record.get('col6');
                        }
                    }
                ],
                sorters: [
                    'col3'
                ]
            }
        }
    },

    bind: {
        store: '{store}'
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