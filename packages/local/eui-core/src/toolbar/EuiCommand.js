/***
 *
 * ## Summary
 *
 * 명령 버튼 (CRUD 등) 그리드에 탑재해 사용한다.
 *
 * # Sample
 *
 *     @example
 *
 *      Ext.define('SAMPLE', {
 *          extend: 'eui.panel.Panel',
 *          title: 'EuiCommand',
 *          items: [
 *              {
 *                  xtype: 'toolbar',
 *                  ui: 'plain',
 *                  items: [
 *                      {
 *                          xtype: 'euiheader',
 *                          title: '제목'
 *                      },
 *                      '->',
 *                      {
 *                          scale: 'medium',
 *                          showPrintBtn: true,
 *                          showRowAddBtn: true,
 *                          showRowDelBtn: true,
 *                          showRegBtn: true,
 *                          showReloadBtn: true,
 *                          showModBtn: true,
 *                          showSaveBtn: true,
 *                          showCloseBtn: true,
 *                          showExcelDownBtn: true,
 *                          xtype: 'euicommand'
 *                      }
 *                  ]
 *              },
 *              {
 *                  xtype : 'euiform',
 *                  margin: 10,
 *                  title: 'PAGE TITLE 페이지 타이틀',
 *                  header: {
 *                      xtype: 'header',
 *                      titlePosition: 0,
 *                      items: [
 *                          {
 *                              hideTextPrintBtn: true,
 *                              hideTextReloadBtn: true,
 *                              hideAddBtnICon: true,
 *                              hideDelBtnICon: true,
 *                              hideRegBtnICon: true,
 *                              hideModBtnICon: true,
 *                              hideSaveBtnICon: true,
 *                              showReloadBtn: true,
 *                              showPrintBtn: true,
 *                              showRowAddBtn: true,
 *                              showRowDelBtn: true,
 *                              showSaveBtn: true,
 *                              xtype: 'euicommand'
 *                          }
 *                      ]
 *                  },
 *                  items: [
 *                      {
 *                          xtype: 'euitext',
 *                          fieldLabel: 'FORM FIELD'
 *                      },
 *                      {
 *                          xtype: 'euitext',
 *                          fieldLabel: 'FORM FIELD'
 *                      }
 *                  ]
 *              }
 *          ]
 *      });
 *      eui.Config.initLocaleMessage();
 *
 *
 *      Ext.create('SAMPLE',{
 *          width: '100%',
 *          renderTo: Ext.getBody()
 *      });
 *
 *
 * # 버튼 표시
 *
 * showXXXBtn 변수를 설정해 버튼을 표시한다. 모든 버튼은 최초 표시되지 않도록 기본값을 false로 하고 있다.
 *
 *      showPrintBtn: true,
 *      showRowAddBtn: true,
 *      showRowDelBtn: true,
 *      showRegBtn: true,
 *      showReloadBtn: true,
 *      showModBtn: true,
 *      showSaveBtn: true,
 *      showCloseBtn: true,
 *      showExcelDownBtn: true,
 *      xtype: 'euicommand'
 *
 * # 버튼 텍스트 변경.
 *
 *  xxxBtnText 변수를 설정해 기본 설정된 버튼의 텍스트 값을 변경할 수 있다.
 *
 *      printBtnText: '출력버튼',
 *      rowAddBtnText: '추가버튼',
 *      rowDelBtnText: '삭제버튼',
 *      regBtnText: '등록버튼',
 *      reloadBtnText: '조회버튼',
 *      modBtnText: '수정버튼',
 *      saveBtnText: '저장버튼',
 *      closeBtnText: '닫기버튼',
 *      excelDownBtnText: '엑셀다운로드버튼',
 *      xtype: 'euicommand'
 **/
Ext.define('eui.toolbar.EuiCommand', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'euicommand',
    ui: 'plain',

    defaultBindProperty: 'store',

    /**
     * @event reloadbtnclick
     * 조회 버튼을 클릭할 경우 발생한다. Store가 바인딩 된 경우 그리드에 리스너를 구현할 수 있고
     * 리스너가 구현되지 않을 경우 eui Grid의 onReload를 호출 그리드를 리로드한다..
     * @param {eui.toolbar.EuiCommand} this
     */

    /**
     * @event printbtnclick
     * 출력 버튼 클릭 시 호출.
     * @param {eui.toolbar.EuiCommand} this
     */

    /**
     * @event rowaddbtnclick
     * 신규 버튼 클릭 시 발생.
     * @param {eui.toolbar.EuiCommand} this
     */

    /**
     * @event rowdeletebtnclick
     * 삭제 버튼 클릭 시 발생. Store가 바인딩 시 리스너 구현이 없을 경우 eui Grid.onRowDelete메소드 호출.
     * @param {eui.toolbar.EuiCommand} this
     */

    /**
     * @event regbtnclick
     * 등록 버튼 클릭 시 발생.
     * @param {eui.toolbar.EuiCommand} this
     */

    /**
     * @event modbtnclick
     * 수정 버튼 클릭 시 발생.
     * @param {eui.toolbar.EuiCommand} this
     */

    /**
     * @event savebtnclick
     * 저장 버튼 클릭 시 발생.
     * @param {eui.toolbar.EuiCommand} this
     */

    config: {
        /**
         * @cfg {String} [printBtnICon]
         * 프린터 버튼의 icon
         */
        printBtnICon: null,

        /**
         * @cfg {String} [printBtnICon]
         * 프린터 버튼의 icon
         */
        rowAddBtnICon: null,

        /**
         * @cfg {String} [rowDelBtnICon]
         * 삭제 버튼의 icon
         */
        rowDelBtnICon: null,

        /**
         * @cfg {String} [regBtnICon]
         * 등록 버튼의 icon
         */
        regBtnICon: null,

        /**
         * @cfg {String} [reloadBtnICon]
         * 조회 버튼의 icon
         */
        reloadBtnICon: null,

        /**
         * @cfg {String} [modBtnICon]
         * 수정 버튼의 icon
         */
        modBtnICon: null,

        /**
         * @cfg {String} [saveBtnICon]
         * 저장 버튼의 icon
         */
        saveBtnICon: null,

        /**
         * @cfg {String} [closeBtnICon]
         * 닫기 버튼의 icon
         */
        closeBtnICon: null,

        /**
         * @cfg {String} [excelDownBtnICon]
         * 엑셀다운로드 버튼의 icon
         */
        excelDownBtnICon: null,

        /**
         * @cfg {String} [scale]
         * 버튼의 scale을 지정한다. 기본값은 small, 그외 medium, large
         */
        scale: 'small',
        /**
         * @cfg {String} [printBtnText]
         * 프린터 버튼의 text
         */
        printBtnText: null,

        /**
         * @cfg {String} [printBtnText]
         * 프린터 버튼의 text
         */
        rowAddBtnText: null,

        /**
         * @cfg {String} [rowDelBtnText]
         * 삭제 버튼의 text
         */
        rowDelBtnText: null,

        /**
         * @cfg {String} [regBtnText]
         * 등록 버튼의 text
         */
        regBtnText: null,

        /**
         * @cfg {String} [reloadBtnText]
         * 조회 버튼의 text
         */
        reloadBtnText: null,

        /**
         * @cfg {String} [modBtnText]
         * 수정 버튼의 text
         */
        modBtnText: null,

        /**
         * @cfg {String} [saveBtnText]
         * 저장 버튼의 text
         */
        saveBtnText: null,

        /**
         * @cfg {String} [closeBtnText]
         * 닫기 버튼의 text
         */
        closeBtnText: null,


        gridCountText: null,

        /**
         * @cfg {String} [excelDownBtnText]
         * 엑셀다운로드 버튼의 text
         */
        excelDownBtnText: null,

        /**
         * @cfg {Boolean} [hideTextPrintBtn]
         * 프린터버튼의 텍스트를 감춘다.
         */
        hideTextPrintBtn: false,

        /**
         * @cfg {Boolean} [hideTextAddBtn]
         * 신규버튼의 텍스트를 감춘다.
         */
        hideTextAddBtn: false,

        /**
         * @cfg {Boolean} [hideTextDelBtn]
         * 삭제버튼의 텍스트를 감춘다.
         */
        hideTextDelBtn: false,

        /**
         * @cfg {Boolean} [hideTextRegBtn]
         * 등록버튼의 텍스트를 감춘다.
         */
        hideTextRegBtn: false,

        /**
         * @cfg {Boolean} [hideTextReloadBtn]
         * 조회버튼의 텍스트를 감춘다.
         */
        hideTextReloadBtn: false,

        /**
         * @cfg {Boolean} [hideTextModBtn]
         * 수정버튼의 텍스트를 감춘다.
         */
        hideTextModBtn: false,

        /**
         * @cfg {Boolean} [hideTextSaveBtn]
         * 저장버튼의 텍스트를 감춘다.
         */
        hideTextSaveBtn: false,

        /**
         * @cfg {Boolean} [hideTextCloseBtn]
         * 닫기버튼의 텍스트를 감춘다.
         */
        hideTextCloseBtn: false,

        /**
         * @cfg {Boolean} [hideTextExcelDownBtn]
         * 엑셀다운로드버튼의 텍스트를 감춘다.
         */
        hideTextExcelDownBtn: false,

        /**
         * @cfg {Boolean} [disablePrintBtn]
         * 프린트버튼의 disabled 상태를 설정한다.
         */
        disablePrintBtn: false,

        /**
         * @cfg {Boolean} [disableRowAddBtn]
         * 신규버튼의 disabled 상태를 설정한다.
         */
        disableRowAddBtn: false,

        /**
         * @cfg {Boolean} [disableRowDelBtn]
         * 삭제버튼의 disabled 상태를 설정한다.
         */
        disableRowDelBtn: false,

        /**
         * @cfg {Boolean} [disableRegBtn]
         * 등록버튼의 disabled 상태를 설정한다.
         */
        disableRegBtn: false,

        /**
         * @cfg {Boolean} [disableReloadBtn]
         * 조회버튼의 disabled 상태를 설정한다.
         */
        disableReloadBtn: false,

        /**
         * @cfg {Boolean} [disableModBtn]
         * 수정버튼의 disabled 상태를 설정한다.
         */
        disableModBtn: false,

        /**
         * @cfg {Boolean} [disableSaveBtn]
         * 저장버튼의 disabled 상태를 설정한다.
         */
        disableSaveBtn: false,

        /**
         * @cfg {Boolean} [disableCloseBtn]
         * 닫기버튼의 disabled 상태를 설정한다.
         */
        disableCloseBtn: false,

        /**
         * @cfg {Boolean} [disableExcelDownBtn]
         * 엑셀다운로드버튼의 disabled 상태를 설정한다.
         */
        disableExcelDownBtn: false,

        /**
         * @cfg {Boolean} [showPrintBtn]
         * 프린트버튼을 보여줄지 설정한다.
         */
        showPrintBtn: false,

        /**
         * @cfg {Boolean} [showRowAddBtn]
         * 신규버튼을 보여줄지 설정한다.
         */
        showRowAddBtn: false,

        /**
         * @cfg {Boolean} [showRowDelBtn]
         * 삭제버튼을 보여줄지 설정한다.
         */
        showRowDelBtn: false,

        /**
         * @cfg {Boolean} [showRegBtn]
         * 등록버튼을 보여줄지 설정한다.
         */
        showRegBtn: false,

        /**
         * @cfg {Boolean} [showReloadBtn]
         * 조회버튼을 보여줄지 설정한다.
         */
        showReloadBtn: false,

        /**
         * @cfg {Boolean} [showModBtn]
         * 수정버튼을 보여줄지 설정한다.
         */
        showModBtn: false,

        /**
         * @cfg {Boolean} [showSaveBtn]
         * 저장버튼을 보여줄지 설정한다.
         */
        showSaveBtn: false,

        /**
         * @cfg {Boolean} [showCloseBtn]
         * 닫기버튼을 보여줄지 설정한다.
         */
        showCloseBtn: false,


        showGridCount: false,

        /**
         * @cfg {Boolean} [showExcelDownBtn]
         * 엑셀다운로드버튼을 보여줄지 설정한다.
         */
        showExcelDownBtn: false,

        /**
         * @cfg {Object} [btnInfo]
         * 내부 변수로 itemId와 함께 버튼의 보여주기 상태를 설정할때 사용된다.
         */
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
        },

        hidePrintBtnICon: false,
        hideAddBtnICon: false,
        hideDelBtnICon: false,
        hideRegBtnICon: false,
        hideReloadBtnICon: false,
        hideModBtnICon: false,
        hideSaveBtnICon: false,
        hideCloseBtnICon: false,
        hideExcelDownBtnICon: false
    },

    /**
     * 그리드의 store가 바인딩된다. 이 경우 그리드의 신규, 삭제, 조회 등을 제어할 수 있다.
     *
     * @param {Ext.data.Store} store 그리드에 바인된 Store
     *
     */
    setStore: function (store) {
        this.store = store;
    },

    /***
     * 모든 버튼의 텍스트 정보를 삭제한다. hideTextXXX 값이 true인 경우 처리한다.
     */
    setTextHide: function () {

        if (this.getHideTextPrintBtn()) {
            this.down('#PRINT').setText(null);
        }

        if (this.getHideTextAddBtn()) {
            this.down('#ADD').setText(null);
        }

        if (this.getHideTextDelBtn()) {
            this.down('#DEL').setText(null);
        }

        if (this.getHideTextRegBtn()) {
            this.down('#REG').setText(null);
        }

        if (this.getHideTextReloadBtn()) {
            this.down('#LOAD').setText(null);
        }

        if (this.getHideTextModBtn()) {
            this.down('#MOD').setText(null);
        }

        if (this.getHideTextSaveBtn()) {
            this.down('#SAVE').setText(null);
        }

        if (this.getHideTextCloseBtn()) {
            this.down('#CLOSE').setText(null);
        }

        if (this.getHideTextExcelDownBtn()) {
            this.down('#EXLDWN').setText(null);
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

    initComponent: function () {
        var me = this;
        if(me.scale == 'medium'){
            Ext.apply(me, {
                defaults: {
                    height: 28
                }
            });
        }

        this.callParent(arguments);
    },

    buttonsAdd: function () {
        var me = this;
        me.add([
            {
                xtype: 'euibutton',
                scale: me.scale,
                cls: 'bgtype1',
                text: me.reloadBtnText || '#{새로고침}',
                itemId: 'LOAD',
                iconCls: (me.hideReloadBtnICon ? null : (me.reloadBtnICon?me.reloadBtnICon:'#{새로고침아이콘}')),
                disabled: me.getDisableReloadBtn(),
                hidden: !me.getShowReloadBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['reloadbtnclick'.toLowerCase()]) {
                            me.fireEvent('reloadbtnclick', owner || me);
                        } else if (owner) {
                            if (owner.hasListeners['reloadbtnclick'.toLowerCase()]) {
                                owner.fireEvent('reloadbtnclick', owner);
                            } else
                                owner.onReload(owner, null, owner);
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                scale: me.scale,
                cls: 'bgtype1',
                text: me.printBtnText || '#{인쇄}',
                itemId: 'PRINT',
                iconCls: (me.hidePrintBtnICon ? null : (me.hidePrintBtnICon?me.printBtnICon:'#{인쇄아이콘}')),
                disabled: me.getDisablePrintBtn(),
                hidden: !me.getShowPrintBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['printbtnclick'.toLowerCase()]) {
                            me.fireEvent('printbtnclick', owner || me);
                        } else if (owner) {
                            if (owner.hasListeners['printbtnclick'.toLowerCase()]) {
                                owner.fireEvent('printbtnclick', owner);
                            }
                        }
                    }
                }
            },
            {
                text: me.excelDownBtnText || '#{엑셀다운로드}',
                scale: me.scale,
                cls: 'bgtype2',
                itemId: 'EXLDWN',
                iconCls: (me.hideExcelDownBtnICon ? null : (me.hideExcelDownBtnICon?me.excelDownBtnICon:'#{엑셀다운로드아이콘}')),
                disabled: me.getDisableExcelDownBtn(),
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
                margin: '0 5 0 5',
                scale: me.scale,
                text: me.rowAddBtnText || '#{행추가}',
                iconCls: (me.hideAddBtnICon ? null : (me.hideAddBtnICon?me.addBtnICon:'#{행추가아이콘}')),
                scope: me,
                itemId: 'ADD',
                disabled: me.getDisableRowAddBtn(),
                hidden: !me.getShowRowAddBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['rowaddbtnclick'.toLowerCase()]) {
                            me.fireEvent('rowaddbtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['rowaddbtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowaddbtnclick', owner);
                            } else {
                                owner.onRowAdd(owner, {
                                    randomInt: Ext.Number.randomInt(1, 1.0E12)
                                }, 0, null);
                            }
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                scale: me.scale,
                text: me.regBtnText || '#{등록}',
                itemId: 'REG',
                iconCls: (me.hideRegBtnICon ? null : (me.hideRegBtnICon?me.regBtnICon:'#{등록아이콘}')),
                disabled: me.getDisableRegBtn(),
                hidden: !me.getShowRegBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['regbtnclick'.toLowerCase()]) {
                            me.fireEvent('regbtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['regbtnclick'.toLowerCase()]) {
                                owner.fireEvent('regbtnclick', owner);
                            }
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                scale: me.scale,
                text: me.modBtnText || '#{수정}',
                itemId: 'MOD',
                iconCls: (me.hideModBtnICon ? null : (me.hideModBtnICon?me.modBtnICon:'#{수정아이콘}')),
                disabled: me.getDisableExcelDownBtn(),
                hidden: !me.getShowModBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['modbtnclick'.toLowerCase()]) {
                            me.fireEvent('modbtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['modbtnclick'.toLowerCase()]) {
                                owner.fireEvent('modbtnclick', owner);
                            }
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                scale: me.scale,
                iconCls: (me.hideDelBtnICon ? null : (me.hideDelBtnICon?me.delBtnICon:'#{행삭제아이콘}')),
                text: me.rowDelBtnText || '#{행삭제}',
                itemId: 'DEL',
                scope: me,
                disabled: me.getDisableRowDelBtn(),
                hidden: !me.getShowRowDelBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['rowdeletebtnclick'.toLowerCase()]) {
                            me.fireEvent('rowdeletebtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['rowdeletebtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowdeletebtnclick', owner);
                            } else
                                owner.onRowDelete(owner, null, owner);
                        }
                    }
                }
            },

            {
                xtype: 'euibutton',
                scale: me.scale,
                text: me.saveBtnText || '#{저장}',
                formBind: true,
                itemId: 'SAVE',
                iconCls: (me.hideSaveBtnICon ? null : (me.hideSaveBtnICon?me.saveBtnICon:'#{저장아이콘}')),
                disabled: me.getDisableSaveBtn(),
                hidden: !me.getShowSaveBtn(),
                listeners: {
                    click: function () {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['savebtnclick'.toLowerCase()]) {
                            me.fireEvent('savebtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['savebtnclick'.toLowerCase()]) {
                                owner.fireEvent('savebtnclick', owner);
                            } else
                                owner.onSave(owner);
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                scale: me.scale,
                text: me.closeBtnText || '#{닫기}',
                itemId: 'CLOSE',
                iconCls: (me.hideCloseBtnICon ? null : (me.hideCloseBtnICon?me.closetnICon:'#{닫기아이콘}')),
                disabled: me.getDisableCloseBtn(),
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

    setDisablePrintBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#PRINT');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setDisableRowAddBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#ADD');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setDisableRowDelBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#DEL');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setDisableRegBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#REG');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setDisableReloadBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#LOAD');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setDisableModBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#MOD');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setDisableSaveBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#SAVE');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setDisableCloseBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#CLOSE');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setDisableExcelDownBtn: function (disable) {
        var me = this,
            btn = me.rendered && me.down('#EXLDWN');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },

    setButtonStatus: function (data) {
        var me = this;
        Ext.each(data, function (status) {
            var config = me.initialConfig[me.getBtnInfo()[status.button]];
            if (config === undefined) {
                me.down('#' + status.button).setHidden(false);
            } else if (Ext.isBoolean(config)) {
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
