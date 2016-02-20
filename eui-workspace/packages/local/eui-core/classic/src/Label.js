Ext.define('eui.form.Label', {
    extend: 'Ext.form.Label',
    alias: 'widget.euilabel',
    cellCls: 'fo-table-row-th',
    allowBlank : true,
    localeProperties: ['html', 'text'],
    initComponent: function () {
        var me = this;
        if(me.allowBlank===false){
            Ext.apply(me, {
                cls: 'fo-required'
            });
        }
        me.callParent(arguments);

        /***
         * form 내부에서 사용시 대상 폼필드 allowBlank설정.
         */
        me.on('afterrender', function(){
           if(Ext.isBoolean(me.initialConfig.allowBlank) && me.nextSibling() && me.nextSibling().isFormField){
                me.nextSibling().allowBlank = me.allowBlank;
            }
        });
    }
});