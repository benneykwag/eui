Ext.define('Eui.sample.view.grid.RecordForm', {
    extend: 'eui.form.Panel',
    xtype: 'sample-basic-recordform',
    requires: [
        'eui.form.Label',
        'eui.form.field.Text'
    ],
    hiddenHeader: true,
    tableColumns:1,
    hiddenSaveBtn: false,
    hiddenCloseBtn: false,
    margin: 5,
    viewModel:{
        formulas: {
            userStatus: {
                bind: {
                    bindTo: '{messageRecord}',
                    deep: true
                },
//                set: function () {
//                    console.log('set', arguments)
//                },
                get: function (user) {
                    console.log('user', user.isValid())
                    var status = {
                        dirty: user ? user.dirty : true,
                        valid : user ? user.isValid(): false
                    };
                    status.validAndDirty = status.dirty && status.valid;
                    return status;
                }
            }
        }
    },

    tbar: [
        '->',
        {
            showSaveBtn: true,
            showCloseBtn: true,
            xtype: 'commandtoolbar'
        }
    ],

    listeners: {
        saveBtnClick : 'onSaveForm'
    },
    items: [
        {
            xtype: 'euitext',
            fieldLabel:'메시지코드',
            bind : '{messageRecord.MSG_ID}'
        },
        {
            fieldLabel: '메시지 내용',
            xtype: 'euitext',
            allowBlank: false,
            bind : '{messageRecord.MSG_LABEL}'
        }
    ]
});