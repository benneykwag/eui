Ext.define('Override.form.field.Base',{
    override : 'Ext.form.field.Base',
    mixins: [
        'eui.mixin.FormField'
    ],
    initComponent : function(){
        this.setAllowBlank();
        this.callParent(arguments);
        this.on('render', function(){
            if(this.previousSibling() && this.previousSibling().xtype == 'euilabel' && !this.allowBlank){
                this.previousSibling().addCls('fo-required');
            }
        });
    }
});