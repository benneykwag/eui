/***
 * formpanel, panel, gridpanel 등의 공통 사항.
 */
Ext.define("eui.mixin.Panel", {
    extend: 'Ext.Mixin',

    mixinConfig: {
    },

    config: {
        // 하단 명령 툴바 제어.
        hiddenBtmTbar: false,
        defaultToolbarPosition: 'top',
        defaultToolbarUi: 'default'
    },

    // grid, form
//    margin: '10 10 10 10',

    /***
     * 명령 라인 버튼 설정
     * hbuttons으로 추가될 경우 기존 버튼과 합쳐보여준다.
     * @param defaultButtons
     * @param otherButtons
     */
    applyButtonToolBar: function (defaultButtons, otherButtons) {
        var me = this;
        if (me.bbar || me.hiddenBtmTbar) {
            return;
        }

        if (otherButtons) {
            Ext.each(otherButtons, function (btn) {
                if (btn.insertBefore) {
                    defaultButtons.unshift(btn);
                } else {
                    defaultButtons.push(btn)
                }
            });
        }

        defaultButtons.unshift('->');

        var visibleCnt = 0;
        Ext.each(defaultButtons, function (btn, idx) {
            if (idx > 0 && (btn.hidden == false || btn.hidden === undefined)) {
                visibleCnt++;
            }
        });

        if (visibleCnt > 0) {
            if(Ext.isEmpty(me.dockedItems)){
                me.dockedItems = [];
            }
            console.log('me.getDefaultUi():', me.getDefaultToolbarUi())
            me.dockedItems.push(
                {
                    xtype: 'toolbar',
                    ui: me.getDefaultToolbarUi(),
                    dock: me.getDefaultToolbarPosition(),
                    items: defaultButtons
                }
            );
        }
        return defaultButtons;
    }
});