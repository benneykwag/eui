/***
 *
 */
Ext.define('Eui.sample.view.grid.MergeGrid2', {
    extend: 'eui.grid.Merge',
    xtype: 'sample-mergegrid2',
    requires: [
        'eui.grid.column.Number'
    ],
    title: 'Rowspan, Colspan Grid',
    frame: true,

    viewModel: {
        stores: {
            store: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: 'resources/data/statdata2.json',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                fields: [
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
                    }
                ],
                sorters: [
                    'idx'
                ]
            }
        }
    },

    bind: {
        store: '{store}'
    },

    groupFields: [
        {
            field: 'col1'
        },
        {
            field: 'col2'
        },
        {
            field: 'col3'
        }
    ],

    columns: [
        {
            text: '구분',
            columns: [
                {
                    text: "시도",
                    dataIndex: 'col1'
                },
                {
                    text: "구/군",
                    dataIndex: 'col2',
                    renderer: function (v) {
                        var value = v.split('@')[1];
                        return value;
                    }
                },
                {
                    text: "동",
                    dataIndex: 'col3',
                    renderer: function (v) {
                        var value = v.split('@')[2];
                        return value;
                    }
                }
            ]
        },
        {
            text: "1월",
            dataIndex: 'month01'
        }
    ]
});