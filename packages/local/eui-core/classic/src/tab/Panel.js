Ext.define('eui.tab.Panel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.euitabpanel',
    ui: 'euitabpanel',
    initComponent: function () {
        var me = this;

        if(me.title){
            Ext.apply(me, {
                iconCls: 'x-fa fa-bars'
            })
        }
        me.callParent(arguments);

    }
});