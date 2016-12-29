/***
 *
 * ## Summary
 *
 * Ext.tree.Panel클래스를 확장했다.
 *
 **/
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

    },

    getCellEditor: function () {
        var plugins = this.plugins;
        if (plugins instanceof Array) {
            for (var i = 0; i < plugins.length; i++) {
                if (Ext.getClassName(plugins[i]) == 'Ext.grid.plugin.CellEditing') {
                    editor = plugins[i];
                    break;
                }
            }
        }
        else {
            if (Ext.getClassName(plugins) == 'Ext.grid.plugin.CellEditing') {
                editor = plugins;
            }
        }
        return editor;
    }
});