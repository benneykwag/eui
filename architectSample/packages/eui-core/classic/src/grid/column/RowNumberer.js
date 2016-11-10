Ext.define('eui.grid.column.RowNumberer', {
    extend: 'Ext.grid.column.Number',
    alias: 'widget.euirownumberer',
	align : 'right',
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    text: 'No',
    width: 40,
    initComponent: function() {
        var me = this;
        if(!me.renderer){
            me.renderer = me.descRowRenderer
        }
        me.callParent(arguments);
    }
});