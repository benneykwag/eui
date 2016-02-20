/***
 * PopUp을 위한 Container
 */
Ext.define('eui.container.PopupContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.sppopupcontainer',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },

    /***
     * HPopupTrigger에 값을 전달한다.
     */
    parentCallBack : function(record, valueField, displayField){
        var trigger = this.__PARENT;
        if(!Ext.isEmpty(trigger) && !Ext.isEmpty(trigger.callBack)){
            Ext.callback(trigger.callBack, trigger, [trigger, record, valueField||trigger.valueField, displayField||trigger.displayField]);
        }else if(Ext.isFunction(this.__PARENT.popupCallback)){
            //화면에서 호출시 리턴 함수 호출 ( popupCallback )
            this.__PARENT.popupCallback( [record, valueField, displayField]);
        }
        Util.getOwnerCt(this).close();
    }
});