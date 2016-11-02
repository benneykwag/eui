Ext.define('eui.panel.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.euipanel',
    cls: 'eui-form-table',
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