Ext.define('Eui.sample.view.grid.Basic', {
    extend: 'eui.grid.Panel',
    xtype: 'sample-basic-grid',


    requires: [
        'Eui.sample.model.Base',
        'Eui.sample.view.grid.BasicModel',
        'eui.toolbar.Command',
        'Eui.sample.view.grid.BasicController'
    ],
    controller: 'sample-basic-grid',

    viewModel: 'sample-basic-grid',
//    selModel: 'cellmodel',

//    session: true,

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
                bind : "{messageRecord.MSG_LABEL}",
                xtype: 'textfield'

            }
        }
    ]
});