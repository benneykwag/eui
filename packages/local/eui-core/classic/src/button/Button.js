Ext.define('eui.button.Button', {
    extend: 'Ext.button.Button',
    xtype: 'spbutton',
//    text: 'SpButton',
//    ui: 'basicbtn',
    localeProperties: ['text'],
    margin: '0 5 2 0',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});