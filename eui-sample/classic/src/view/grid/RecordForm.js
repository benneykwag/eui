Ext.define('Eui.sample.view.grid.RecordForm', {
    extend: 'eui.form.Panel',
    xtype: 'sample-basic-recordform',
    requires: [
        'eui.form.Label',
        'eui.form.field.Text'
    ],
    hiddenHeader: true,
    tableColumns: 2,
    hiddenSaveBtn: false,
    hiddenCloseBtn: false,
    margin: 5,

    tbar: [
        '->',
        {
            showSaveBtn: true,
            showCloseBtn: true,
            xtype: 'commandtoolbar'
        }
    ],

    listeners: {
        saveBtnClick: 'onSaveForm'
    },
    items: [
        {
            xtype: 'euilabel',
            text: '메시지 코드',
            allowBlank: false
        },
        {
            xtype: 'euitext',

            bind: '{messageRecord.MSG_ID}'
        },
        {
            xtype: 'euilabel',
            text: '메시지 내용',
            allowBlank: false
        },
        {
            xtype: 'euitext',
            bind: '{messageRecord.MSG_LABEL}'
        }
    ]
});