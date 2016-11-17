/***
 *
 * ## Summary
 *
 * 일반 컬럼 클래스 .
 * 특이사항 없음.
 */
Ext.define('eui.grid.column.Column', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.euicolumn',

    initComponent: function() {
        var me = this;

        me.callParent(arguments);
    }
});