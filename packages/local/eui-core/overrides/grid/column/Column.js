Ext.define('Override.grid.column.Column', {
    override : 'Ext.grid.column.Column',
    localeProperties : ['text'],
    initComponent: function () {
        if(this.editor){
            this.cls = 'dirtymark';
        }
        this.callParent(arguments);
    }
});