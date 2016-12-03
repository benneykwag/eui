/***
 *
 * ## Summary
 *
 * Ext.form.field.Data를 확장. 날자 포맷 지정 및 스타일 적용
 *
 **/

Ext.define('eui.form.field.Date', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.euidate',
    submitFormat: 'Ymd',
    format: 'Y-m-d',
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