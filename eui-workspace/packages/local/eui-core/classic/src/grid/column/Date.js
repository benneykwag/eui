Ext.define('eui.grid.column.Date', {
    extend: 'Ext.grid.column.Date',
    alias: 'widget.spdatecolumn',
    format: 'Y/m/d',
	align : 'center',
	width : 100,
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    initComponent: function() {
        var me = this;
        if(!me.renderer){
            me.renderer = me.dateRenderer
        }
        me.callParent(arguments);
    }
});