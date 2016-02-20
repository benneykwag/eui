Ext.define('eui.grid.column.Number', {
    extend: 'Ext.grid.column.Number',
    alias: 'widget.spnumbercolumn',
	align : 'right',
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    initComponent: function() {
        var me = this;
        if(!me.renderer){
            me.renderer = me.currencyRenderer
        }
        me.callParent(arguments);
    }
});