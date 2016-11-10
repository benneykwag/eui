Ext.define('eui.grid.column.Number', {
    extend: 'Ext.grid.column.Number',
    alias: 'widget.euinumbercolumn',
    align : 'right',
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    config: {
        /**
         * @cfg {Boolean} [isCurrency=`true`]
         * currencyRenderer가 기본 적용되고 이를 피하고 싶을 경우 `false`로 설정한다.
         * false로 지정하고 포맷을 지정할 경우
         * 예 ) 소숫점 3자리로 모두 통일 할 경우
         * isCurrency: false,
         * format:'0,000.000/i',
         */
        isCurrency: true
    },
    initComponent: function() {
        var me = this;
        if(!me.renderer && me.isCurrency){
            me.renderer = me.currencyRenderer
        }
        me.callParent(arguments);
    }
});