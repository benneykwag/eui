Ext.define('eui.panel.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.euipanel',
    cls: 'eui-form-table',
    config: {
        usePagingToolbar: false
    },

    initComponent: function () {
        var me = this;

        if(me.iconCls){
            me.setHideHeaderICon(false);
        }

        if (me.title && !me.hideHeaderICon) {
            Ext.applyIf(me, {
                iconCls: 'x-fa fa-pencil-square'
            })
        }
        me.callParent(arguments);

    }
});