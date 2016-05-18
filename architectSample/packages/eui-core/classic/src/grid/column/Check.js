Ext.define('eui.grid.column.Check', {
    extend: 'Ext.grid.column.Check',
    alias: 'widget.spcheckcolumn',

    isRecordChecked: function (record) {
        var prop = this.property;
        if (prop) {
            return record[prop] == 'Y';
        }
        return record.get(this.dataIndex) == 'Y';
    },

    setRecordCheck: function (record, checked, cell, row, e) {
        var me = this,
            prop = me.property, val = checked? 'Y' : 'N';

        if (prop) {
            record[prop] = val;
        } else {
            record.set(me.dataIndex, val);
        }
        me.updater(cell, checked);
    },

    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});