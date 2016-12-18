Ext.define('eui.container.PopupContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.euipopupcontainer',

    /***
     * HPopupTrigger에 값을 전달한다.
     */
    parentCallBack: function (record, valueField, displayField) {
        var trigger = this.__PARENT;
        if (!Ext.isEmpty(trigger) && !Ext.isEmpty(trigger.callBack)) {
            Ext.callback(trigger.callBack, trigger, [trigger, record, valueField || trigger.valueField, displayField || trigger.displayField]);
            trigger.fireEvent('popupsetvalues', trigger, record, valueField || trigger.valueField, displayField || trigger.displayField)
        } else if (Ext.isFunction(this.__PARENT.popupCallback)) {
            //화면에서 호출시 리턴 함수 호출 ( popupCallback )
            this.__PARENT.popupCallback([record, valueField, displayField]);
        }
//        var owner = Util.getOwnerCt(this);
//        if (owner.xtype.indexOf('window') != -1) {
//            owner.close();
//        } else {
////            owner.hide();
//        }
    }
});