Ext.define('eui.form.field.Trigger', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.sptrigger',

    cellCls: 'fo-table-row-td',

    triggers: {
        search: {
//            cls: 'x-form-clear-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },
    onTriggerClick: function() {
        //noinspection JSUnresolvedFunction
        this.setValue('');
        this.fireEvent("ontriggerclick", this, event);
    },

    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});