Ext.define('eui.button.Button', {
    extend: 'Ext.button.Button',
    xtype: 'euibutton',
//    text: 'SpButton',
//    ui: 'basicbtn',

    config: {
        showText: true
    },

    localeProperties: ['text','iconCls'],
    margin: '0 5 2 0',
    initComponent: function() {
        var me = this;
        if(!me.getShowText()){
            delete me.text;
        }
        me.callParent(arguments);
    }
});