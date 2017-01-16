Ext.define('eui.ux.file.FileGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'filegrid',
    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            store: {
                autoLoad: false,
                proxy: {
                    type: 'rest',
                    url: Config.fileuploadListUrl,
                    extraParams: me.fileParams,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                sorters: [
                    {
                        property: 'ADD_DATE',
                        direction: 'ASC'
                    }
                ],
                fields: []

            }
        });
        me.callParent(arguments);
    },

    columns: [
        {
            text: 'Filename',
            flex: 1,
            dataIndex: 'NM_FILE'
        },
        {
            text: 'Size',
            align: 'right',
            width: 70,
            dataIndex: 'SIZE_FILE',
            renderer: function (value) {
                return Ext.util.Format.fileSize(value);
            }
        },
        {
            text: 'Add User',
            align: 'center',
            width: 70,
            dataIndex: 'ID_REV_PRSN'
        },
        {
            xtype: 'datecolumn',
            format: 'Y.m.d G:i a',
            width: 150,
            text: 'Add Date',
            align: 'center',
            dataIndex: 'DT_REV'
        },
        {
            xtype: 'actioncolumn',
            text: 'Down',
            width: 40,
            items: [
                {
                    icon: 'resources/images/customui/icon/COM.png',
                    handler: function (view, rowIndex, colIndex, item, e, record, row) {
                        Util.fileClick(record.get('S_FUNC_CODE'), record.get('ID_ATCH_FILE'), record.get('NM_FILE'))
                    }
                }
            ]
        },
        {
            xtype: 'actioncolumn',
            text: 'Del',
            width: 40,
            items: [
                {
                    icon: 'resources/images/customui/icon/COM.png',
                    handler: function (view, rowIndex, colIndex, item, e, record, row) {
                        var store = this.up('grid').store;
                        Ext.Msg.confirm('File Delete', 'Are you sure you want to delete this file?', function (id, value) {
                            if (id === 'yes') {
                                Util.CommonAjax({
                                    url: Config.filedeleteUrl,
                                    pSync: false,
                                    params: record.getData(),
                                    pCallback: function (pScope, params, retData) {
                                        if (retData.TYPE === 1) {
                                            store.load();
                                        }
                                    }
                                });
                            }
                        }, this);
                    }
                }
            ]
        }
    ]
})
