Ext.define('Eui.sample.view.grid.RecordForm', {
    extend: 'eui.form.Panel',
    xtype: 'sample-basic-recordform',
    hiddenHeader: true,
    tableColumns:2,
    hiddenSaveBtn: false,
    hiddenCloseBtn: false,
    margin: 5,
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