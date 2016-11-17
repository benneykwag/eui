/***
 * ## Summary
 *
 * 체크박스용 컬럼 : true/false를 사용하지 않고 Y/N을 사용한다.
 */
Ext.define('eui.grid.column.Check', {
    extend: 'Ext.grid.column.Check',
    alias: 'widget.euicheckcolumn',

    isRecordChecked: function (record) {
        var prop = this.property;
        if (prop) {
            return record[prop] == 'Y';
        }
        return record.get(this.dataIndex) == 'Y';
    },
    setRecordCheck: function (record, recordIndex, checked, cell) {
        var me = this,
            prop = me.property,
            result,
            val = checked ? 'Y' : 'N';

        // Only proceed if we NEED to change
        if (prop ? record[prop] : record.get(me.dataIndex) != val) {
            if (prop) {
                record[prop] = val;

            } else {
                record.set(me.dataIndex, val);
            }
            me.updater(cell, checked);
        }
    },

    defaultRenderer: function(value, cellValues) {

        var me = this,
            cls = me.checkboxCls,
            tip = me.tooltip,
            value = (value == 'Y'?true:false);

        if (me.invert) {
            value = !value;
        }
        if (me.disabled) {
            cellValues.tdCls += ' ' + me.disabledCls;
        }

        if (value) {
            cls += ' ' + me.checkboxCheckedCls;
            tip = me.checkedTooltip || tip;
        }

        if (me.useAriaElements) {
            cellValues.tdAttr += ' aria-describedby="' + me.id + '-cell-description' +
                (!value ? '-not' : '') + '-selected"';
        }

        // This will update the header state on the next animation frame
        // after all rows have been rendered.
        me.updateHeaderState();

        return '<span ' + (tip || '') + ' class="' + cls + '" role="' + me.checkboxAriaRole + '"' +
            (!me.ariaStaticRoles[me.checkboxAriaRole] ? ' tabIndex="0"' : '') +
            '></span>';
    }
});