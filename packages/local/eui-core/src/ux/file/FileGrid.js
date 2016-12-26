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
//        me.on('afterrender', function () {
//            var button = $('#file1')
//            new AjaxUpload(button, {
//                action: globalVar.HurlPrefix + 'api/file/upload',
////			action: 'do-nothing.htm',
//                name: 'file',
//                data: {
//                    COMPANY_CODE : 'HTNS',
//                    REF_NO: 'chat0001',
//                    REF_TYPE : 'RM',
//                    S_FUNC_CODE : 'CH'
//                },
//                customHeaders: {
//                    'X-CSRF-TOKEN':+globalVar.csrfToken
////                    _csrf : '1111'+globalVar.csrfToken
//                },
//                onSubmit : function(file, ext){
//
//                },
//                onComplete: function(file, response){
//
//                }
//            });
//        })
    },

    columns: [
        {
            text: 'Filename',
            flex: 1,
            dataIndex: 'FILE_NAME'
        },
        {
            text: 'Size',
            align: 'right',
            width: 70,
            dataIndex: 'FILE_SIZE'
        },
        {
            text: 'Add User',
            align: 'center',
            width: 70,
            dataIndex: 'ADD_USER_NAME'
        },
        {
            xtype: 'datecolumn',
            format: 'Y.m.d G:i a',
            width: 150,
            text: 'Add Date',
            align: 'center',
            dataIndex: 'ADD_DATE'
        },
        {
            xtype: 'actioncolumn',
            text: 'Down',
            width: 40,
            items: [
                {
                    icon: 'resources/images/customui/icon/COM.png',
                    handler: function (view, rowIndex, colIndex, item, e, record, row) {
                        Util.fileClick(record.get('S_FUNC_CODE'), record.get('FILE_MGT_CODE'), record.get('FILE_NAME'))
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