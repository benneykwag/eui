Ext.define('eui.form.field.Date', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.spdate',
    submitFormat: 'Ymd',
    hideLabel: true,
    format: 'Y.m.d',
    altFormats: 'Ymd',
    value: new Date(),
    dateNum : null,
    width: '100%',
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        var dateNum = me.dateNum;
        me.callParent(arguments);

        if(!Ext.isEmpty(dateNum)){
        	me.setValue(me.dayCal(new Date(),dateNum));
        }
    },
    
    dayCal : function(val,num){
    	val.setDate(val.getDate()+num);
    	return val;
    }

    
});