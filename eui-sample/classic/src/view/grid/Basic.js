Ext.define('Eui.sample.view.grid.Basic', {
    extend: 'Ext.panel.Panel',
    xtype: 'sample-basic-grid',

    title: '#{행추가2}',

    requires: [
        'eui.grid.Panel',
        'Eui.sample.view.grid.RecordForm',
        'Eui.sample.model.Base',
        'Eui.sample.view.grid.BasicModel',
        'eui.toolbar.Command',
        'Eui.sample.view.grid.BasicController'
    ],
    controller: 'sample-basic-grid',

    viewModel: 'sample-basic-grid',

    layout: 'fit',

    items: [
        {
            xtype: 'euigrid',
            plugins: {
                ptype: 'cellediting',
                clicksToEdit: 2
            },
            selModel: {
                mode: 'SIMPLE',
                selType: 'checkboxmodel'
            },
            /***
             * 페이징 툴바 사용 설정.
             */
            usePagingToolbar: true,
            tbar: [
                {
                    showRowAddBtn: true,
                    showRowDelBtn: true,
                    showRegBtn: true,
                    showModBtn: true,
                    showSaveBtn: true,
                    showReloadBtn: true,
                    xtype: 'commandtoolbar'
                }
            ],
            bind: {
                store: '{mystore}'
            },
            listeners: {
                select: 'onGridSelect',
                regBtnClick: 'onRowReg',
                rowDeleteBtnClick: 'onRowDelete',
                modBtnClick: 'onRowMod',
                rowAddBtnClick: 'onRowAdd',
                saveBtnClick: 'onRowSave'
            },

            columns: [
                {
                    text: '#{행추가2}',
                    width: 100,
                    dataIndex: 'MSG_ID',
                    editor: {
                        bind: "{messageRecord.MSG_ID}",
                        xtype: 'textfield'
                    }
                },
                {
                    text: 'MSG_LABEL',
                    flex: 1,
                    dataIndex: 'MSG_LABEL',
                    editor: {
                        bind: "{messageRecord.MSG_LABEL}",
                        xtype: 'textfield'

                    }
                }
            ]

        }
    ]

});