Ext.define('eui.tab.Panel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.euitabpanel',
    ui: 'euitabpanel',

    /**
     * @event euitabload
     * 탭 변경에 따른 하위 자식의 데이터 재로드 처리.
     * @param {Object[]} 파라메터
     */

    initComponent: function () {
        var me = this;

        if (me.title) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-bars'
            })
        }
        me.callParent(arguments);
    },

    listeners: {
        /***
         * 탭 변경시마다 파라메터를 비교해 다를 경우 euitabload이벤트를 발생시킨다.
         * @param tabPanel
         * @param newCard
         * @param oldCard
         */
        tabchange: function (tabPanel, newCard, oldCard) {
            if (JSON.stringify(tabPanel.tabLoadParameters) != JSON.stringify(newCard.tabLoadParameters)) {
                newCard.fireEvent('euitabload', tabPanel.tabLoadParameters);
                newCard.tabLoadParameters = tabPanel.tabLoadParameters;
            }
        },
        /***
         * 하위 아이템에게 euitabload이벤트를 발생시켜 데이터를 로드하도록 한다.
         * @param parameters
         * @param e
         */
        euitabload: function (parameters, e) {
            var activeItem = this.getLayout().getActiveItem();
            activeItem.fireEvent('euitabload', parameters, e)
            this.tabLoadParameters = activeItem.tabLoadParameters = parameters;
        }
    }

});