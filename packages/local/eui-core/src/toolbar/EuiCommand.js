/***
 *
 * ## Summary
 *
 * 명령 버튼 (CRUD 등) 그리드에 탑재해 사용한다.
 **/
Ext.define('eui.toolbar.EuiCommand', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'euicommand',
    ui: 'plain',
    defaultBindProperty: 'store',

    config: {
        /**
         * @cfg {String} [null]
         * 프린트 버튼의 텍스트 정보
         */
        printBtnText: null,
        rowAddBtnText: null,
        rowDelBtnText: null,
        regBtnText: null,
        reloadBtnText: null,
        modBtnText: null,
        saveBtnText: null,
        closeBtnText: null,
        gridCountText: null,
        excelDownBtnText: null,

        showText: true,
        hideTextPrintBtn: true,
        hideTextReloadBtn: true,

        showPrintBtn: false,
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRegBtn: false,
        showReloadBtn: false,
        showModBtn: false,
        showSaveBtn: false,
        showCloseBtn: false,
        showGridCount: false,
        showExcelDownBtn: false,
        btnInfo: {
            PRINT: 'showPrintBtn',
            ADD: 'showRowAddBtn',
            DEL: 'showRowDelBtn',
            REG: 'showRegBtn',
            LOAD: 'showReloadBtn',
            MOD: 'showModBtn',
            SAVE: 'showSaveBtn',
            CLOSE: 'showCloseBtn',
            EXLDWN: 'showExcelDownBtn'
        }
    },

    setStore: function (store) {
        this.store = store;
    },

    setTextHide: function () {
        if (this.getHideTextPrintBtn()) {
            this.down('#PRINT').setText(null);
        }
        if (this.getHideTextReloadBtn()) {
            this.down('#LOAD').setText(null);
        }
    },

    /***
     * store 가 bind된 경우 바인딩 스토어의
     * 그리드 및 트리그리드를 찾는다
     */
    getStoreOwner: function () {
        var me = this;
        if (me.store) {
            Ext.each(Ext.ComponentQuery.query('grid,treepanel'), function (cmp) {
                if (cmp.getStore().getId() === me.store.getId()) {
                    me = cmp;
                }
            });
        } else {
            // euicommand에 바로 바인드 할수 없는 경우.
            me = this.up('grid,treepanel');
        }
        return me;
    },

    buttonsAdd: function () {
        var me = this;
        me.add([
            {
                xtype: 'euibutton',
                text: me.reloadBtnText||'#{조회}',
                itemId: 'LOAD',
                iconCls: '#{조회아이콘}',
                hidden: !me.getShowReloadBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['reloadbtnclick'.toLowerCase()]) {
                            me.fireEvent('reloadbtnclick', owner);
                        } else {
                            owner.onReload();
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.printBtnText||'#{인쇄}',
                itemId: 'PRINT',
                iconCls: '#{인쇄아이콘}',
                hidden: !me.getShowPrintBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['printbtnclick'.toLowerCase()]) {
                            me.fireEvent('printbtnclick', owner, me);
                        }
                    }
                }
            },
            {
                text: me.excelDownBtnText||'#{엑셀다운로드}',
                itemId: 'EXLDWN',
                iconCls: '#{엑셀다운로드아이콘}',
                hidden: !me.getShowExcelDownBtn(),
                xtype: 'exporterbutton',
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        this.setComponent(owner);
                        this.onClick2();
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.rowAddBtnText||'#{행추가}',
                iconCls: '#{행추가아이콘}',
                scope: me,
                itemId: 'ADD',
                showText: me.getShowText(),
                hidden: !me.getShowRowAddBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['rowaddbtnclick'.toLowerCase()]) {
                            me.fireEvent('rowaddbtnclick', owner);
                        } else {
                            owner.onRowAdd(owner, {
                                randomInt: Ext.Number.randomInt(1, 1000000000000)
                            }, 0, null);
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                iconCls: '#{행삭제아이콘}',
                text: me.rowDelBtnText||'#{행삭제}',
                itemId: 'DEL',
                scope: me,
                hidden: !me.getShowRowDelBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['rowdeletebtnclick'.toLowerCase()]) {
                            me.fireEvent('rowdeletebtnclick', owner);
                        } else {
                            owner.onRowDelete(owner, null, owner);
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.regBtnText||'#{등록}',
                itemId: 'REG',
                iconCls: '#{등록아이콘}',
                hidden: !me.getShowRegBtn(),
                listeners: {
                    click: function () {
                        me.fireEvent('regbtnclick', me);
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.modBtnText||'#{수정}',
                itemId: 'MOD',
                iconCls: '#{수정아이콘}',
                hidden: !me.getShowModBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        me.fireEvent('modbtnclick', owner);
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.saveBtnText||'#{저장}',
                formBind: true,
                itemId: 'SAVE',
                iconCls: '#{저장아이콘}',
                hidden: !me.getShowSaveBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['savebtnclick'.toLowerCase()]) {
                            me.fireEvent('savebtnclick', owner);
                        }
                    }
                }
            },

            {
                xtype: 'euibutton',
                text: me.closeBtnText||'#{닫기}',
                itemId: 'CLOSE',
                iconCls: 'x-fa fa-sign-out',
                hidden: !me.getShowCloseBtn(),
                listeners: {
                    click: function () {
                        var window = Util.getOwnerCt(this);
                        if (Util.getOwnerCt(this).xtype === 'window') {
                            window.close();
                        } else {
                            Ext.Error.raise({
                                msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                            });
                        }
                    }
                }
            }
        ]);

        me.setTextHide();
    },

    /***
     * 통신을 통해 버튼을 제어하기 전에 미리 초기화 한다
     */
    setAllButtonShow: function (visible) {
//        this.setShowPrintBtn(visible);
//        this.setShowRowAddBtn(visible);
//        this.setShowRowDelBtn(visible);
//        this.setShowRegBtn(visible);
//        this.setShowReloadBtn(visible);
//        this.setShowModBtn(visible);
//        this.setShowSaveBtn(visible);
//        this.setShowGridCount(visible);
//        this.setShowExcelDownBtn(visible);
    },

    setButtonStatus: function(data) {
        var me = this;
        Ext.each(data, function(status) {
            var config = me.initialConfig[me.getBtnInfo()[status.button]];
            if(config === undefined){
                me.down('#' + status.button).setHidden(false);
            }else if(Ext.isBoolean(config)){
                me.down('#' + status.button).setHidden(!config);
            }
        });
    },

    beforeRender: function () {
        var me = this;
        this.callParent(arguments);
        if (Config.commandButtonControllerUrl) {
            Util.CommonAjax({
                method: 'POST',
                url: Config.commandButtonControllerUrl,
                params: me.params,
                pCallback: function (v, params, result) {
                    if (result.success) {
                        me.setAllButtonShow(false);
                        me.buttonsAdd();
                        me.setButtonStatus(result.data)
                    }
                }
            });
        } else {
            me.buttonsAdd();
        }
    }

});