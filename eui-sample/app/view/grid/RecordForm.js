Ext.define('Eui.sample.view.grid.RecordForm', {
    extend: 'eui.form.Panel',
    xtype: 'sample-basic-recordform',
    hiddenHeader: true,
    tableColumns:2,
    hiddenSaveBtn: false,
    hiddenCloseBtn: false,
    margin: 5,
    modelValidation: true,
//    config: {
        c: true,
//    },
//    viewModel:{
//        formulas: {
//            userStatus: {
//                bind: {
//                    bindTo: '{messageRecord}',
//                    deep: true
//                },
//                set: function () {
//                    console.log('set', arguments)
//                },
//                get: function (user) {
//                    console.log('user', user.isValid())
//                    var status = {
//                        dirty: user ? user.dirty : true,
//                        valid : user ? user.isValid(): false
//                    };
//                    status.validAndDirty = status.dirty && status.valid;
//                    return status;
//                }
//            }
//        }
//    },

    reference: 'a',
    publishes: 'c',
    items: [
        {
            xtype:'euilabel',
              text: '메시지 코드'
        },
        {
            xtype: 'euitext',

            bind : '{messageRecord.MSG_ID}'
        },
        {
            xtype:'euilabel',
            text: '메시지 내용'
        },
        {
            xtype: 'euitext',
            bind : '{messageRecord.MSG_LABEL}'
        }
    ]
});