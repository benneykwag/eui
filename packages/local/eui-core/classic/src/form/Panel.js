Ext.define('eui.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.euiform',
    localeProperties: ['title'],
    requires: [
        'eui.button.Button',
        'Ext.layout.container.Column',
        'eui.button.Button',
//        'com.ux.form.field.HTriggerCombo',
//        'com.ux.form.HFieldContainer',
//        'com.ux.form.field.HCheckbox',
//        'com.ux.form.field.HComboBox',
//        'com.ux.form.field.HText',
//        'com.ux.form.field.HTextArea',
//        'com.ux.form.field.HTrigger',
//        'com.ux.form.field.HNumber',
//        'com.ux.button.HButton',
//        'com.ux.form.field.HPopupTriggerSet',
        'Ext.layout.container.Table'
    ],
    mixins: [
        'eui.mixin.Panel'
    ],

    cls: 'eui-form-table',
    collapsed: false,
    collapsible: false,
    modelValidation: true,

    config: {
//        defaultToolbarUi: 'footer',
        // 하단 명령 툴바 제어.
        hiddenBtmTbar: false,
        hiddenCloseBtn: true,
        hiddenHeader: false,
        hiddenSearchBtn: true,
        hiddenPrintBtn: true,
        hiddenDeleteBtn: true,
        hiddenSaveBtn: true,
        hiddenClearBtn: true,
        // table layout을 사용치 않는다면 false로 설정할 것.
        useTableLayout: true,
        tableColumns: 4,
        hbuttons: null,

        /***
         * 브라우저 사이즈를 992이하로 줄일 경우 tableColumns의 값이 1로 변경되도록 조정한다.
         * 다시 사이즈를 늘리면 최초 지정한 tableColumns로 복원한다.
         */
        useRespColumn: true,

        usePagingToolbar: false
    },

    initComponent: function () {
        var me = this;
//        me.setHeader();
//        me.setBottomToolbar();
        me.setTableLayout();

        if(me.iconCls){
            me.setHideHeaderICon(false);
        }

        if (me.title && !me.hideHeaderICon) {
            Ext.applyIf(me, {
                iconCls: 'x-fa fa-pencil-square'
            })
        }

        me.callParent(arguments);
        me.on('afterrender', function () {
            me.isValid();
        }, me, {
            delay: 500
        });
        if(me.useRespColumn){
            me.on('resize', me.responsiveColumn);
        }
    },

    /***
     * 브라우저 사이즈에 따라 table layout의 column값을 조정한다.
     * 사이즈를 줄일 경우 1로 변경하고 사이즈를 다시 늘릴 경우 최초 값으로
     * 복원한다.
     * @param ct
     * @param width
     * @param height
     */
    responsiveColumn : function (ct, width, height) {
        if(ct.tableColumns == 1){
            return;
        }
        if(window.innerWidth < 992) {
            if(ct.getLayout().columns !== 1){
                ct.beforeColumn =  ct.getLayout().columns;
                ct.getLayout().columns = 1;
                ct.updateLayout();
            }
        }else{
            if(ct.getLayout().columns == 1){
                ct.getLayout().columns = ct.beforeColumn;
                ct.updateLayout();
            }
        }
    },

    setBottomToolbar: function () {
        var me = this;
        var buttons = [
            {
                xtype: 'euibutton',
                formBind: true,
                disabled: true,
                code: 'search',
                iconCls: 'x-fa fa-search-plus',
                text: '검색',
                hidden: me.getHiddenSearchBtn(),
                listeners: {
                    click: {
                        fn: function (button, e, eOpts) {
                            me.fireEvent('baseformsearch', me);
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                formBind: true,
                code: 'save',
                iconCls: 'x-fa fa-save',
                text: '저장',
                hidden: me.getHiddenSaveBtn(),
                listeners: {
                    click: {
                        fn: function (button, e, eOpts) {
                            me.fireEvent('baseformsave', me);
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                formBind: true,
                disabled: true,
                code: 'delete',
                iconCls: 'x-fa fa-eraser',
                text: '삭제',
                hidden: me.getHiddenDeleteBtn(),
                listeners: {
                    click: {
                        fn: function (button, e, eOpts) {
                            me.fireEvent('baseformdelete', me);
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                code: 'delete',
                text: '닫기',
                iconCls: 'x-fa fa-sign-out',
                hidden: me.getHiddenCloseBtn(),
                handler: function () {
                    var window = Util.getOwnerCt(this);
                    if (Util.getOwnerCt(this).xtype === 'window') {
                        window.close();
                    } else {
                        Ext.Error.raise({
                            msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                        });
                    }
                }
            },
            {
                xtype: 'euibutton',
                code: 'delete',
                text: '출력',
                iconCls: 'x-fa fa-print',
                hidden: me.getHiddenPrintBtn(),
                handler: function () {
                    var window = Util.getOwnerCt(this);
                    if (Util.getOwnerCt(this).xtype === 'window') {
                        window.close();
                    } else {
                        Ext.Error.raise({
                            msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                        });
                    }
                }
            },
            {
                xtype: 'euibutton',
                code: 'clear',
                text: '취소',
                iconCls: 'x-fa fa-retweet',
                hidden: me.getHiddenClearBtn(),
                handler: function () {
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
        ];
        this.applyButtonToolBar(buttons, me.otherButtons);
    },

    setTableLayout: function () {
        var me = this;
        if (me.getUseTableLayout()) {
            Ext.apply(me, {
                layout: {
                    type: 'table',
                    columns: me.getTableColumns(),
                    tableAttrs: {
                        style: {
                            width: '100%'
                        }
                    }
                }
            })
        }
    },

    setHeader: function () {
        var me = this;
        var header = {
            titlePosition: 0,
            hidden: me.getHiddenHeader(),
            items: [
                {
                    xtype: 'euibutton',
                    iconCls: 'x-fa fa-print'
//                    text: '프린트',
//                    hidden: me.getHiddenHeaderPrintBtn()
                },

                {
                    xtype: 'euibutton',
                    iconCls: 'x-fa fa-sign-out',
//                    hidden: me.getHiddenHeaderClearBtn(),
                    listeners: {
                        click: {
                            fn: function (button, e, eOpts) {
                                var values = me.getForm().getValues();
                                Ext.iterate(values, function (key, value) {
                                    values[key] = null;
                                });
                                //valueObject의 의 데이터를 null로 입력
                                me.getForm().setValues(values);

                                me.fireEvent('baseformreset', me);
                            }
                        }
                    }
                }
            ]
        };

        Ext.apply(me, {
            header: header
        });

    }
});