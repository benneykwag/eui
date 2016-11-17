/***
 *
 * ## Summary
 *
 * 패널 클래스 .
 */
Ext.define('eui.panel.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.euipanel',
    cls: 'eui-form-table',
    config: {
        /**
         * @cfg {Boolean} [usePagingToolbar=`false`]
         * 기본 아이콘을 보이지 않게 한다. 보이게 하려면 `true`로 설정한다.
         */
        usePagingToolbar: false
    },

    initComponent: function () {
        var me = this;

        if(me.iconCls){
            me.setHideHeaderICon(false);
        }

        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-pencil-square'
            })
        }
        me.callParent(arguments);

    }
});