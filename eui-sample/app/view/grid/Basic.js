Ext.define('Eui.sample.view.grid.Basic', {
    extend: 'eui.grid.Panel',
    xtype: 'sample-basic-grid',
    bind: {
        title: '기본 1그리드{loremIpsum}'
    },

    requires: [
        'Eui.sample.model.Base',
        'Eui.sample.view.grid.BasicModel',
        'eui.toolbar.Command',
        'Eui.sample.view.grid.BasicController'
    ],
    controller: 'sample-basic-grid',

    viewModel: {
        type: 'sample-basic-grid'
    },
    selModel: 'cellmodel',
    plugins: {
        ptype: 'cellediting',
        clicksToEdit: 1
    },
//    selModel: {
//        mode: 'SIMPLE',
//        selType: 'checkboxmodel'
//    },
    /***
     * 페이징 툴바 사용 설정.
     */
    usePagingToolbar: true,
    tbar: [
        {
            showRowAddBtn: true,
            showRowDelBtn: true,
            showRowRegBtn: true,
            showRowModBtn: true,
            showRowSaveBtn: true,
            xtype: 'commandtoolbar'
        },
        '-'
    ],
    bind: {
        store: '{mystore}'
    },
    listeners: {
        select: 'onGridSelect',
        rowreg: 'onRowReg',
        rowdelete: 'onRowDelete',
        rowupdate: function () {
            console.log('SPGridRowMod called..');
        },
        rowadd: 'onRowAdd',
        rowsave: 'onRowSave'
    },

    columns: [
        {
            text: 'MSG_ID',
            width: 100,
            dataIndex: 'MSG_ID',
            editor: {
                bind : "{messageRecord.MSG_ID}",
                xtype: 'textfield'
            }
        },
        {
            text: 'MSG_LABEL',
            flex: 1,
            dataIndex: 'MSG_LABEL',
            editor: {
                xtype: 'textfield'

            }
        }
    ]
});