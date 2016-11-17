Ext.define('eui.tree.Panel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.euitreepanel',
    cls: 'eui-form-table',
    rootVisible: false,
    useArrows: true,
    config: {
    },

    initComponent: function () {
        var me = this;

        if(me.iconCls){
            me.setHideHeaderICon(false);
        }

        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-pencil-square'
            })
        }
        me.callParent(arguments);

    }
});