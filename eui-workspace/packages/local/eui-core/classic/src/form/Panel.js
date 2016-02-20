Ext.define('eui.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.spform',
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

    cls: 'fo-panel-table',
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
        hbuttons: null
    },

    initComponent: function () {
        var me = this;
        me.setHeader();
        me.setBottomToolbar();
        me.setTableLayout();
        me.callParent(arguments);
        me.on('afterrender', function () {
            this.isValid();
        });
    },

    setBottomToolbar: function () {
        var me = this;
        var buttons = [
            {
                xtype: 'spbutton',
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
                xtype: 'spbutton',
                formBind: true,
                disabled: true,
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
                xtype: 'spbutton',
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
                xtype: 'spbutton',
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
                xtype: 'spbutton',
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
                xtype: 'spbutton',
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
                    xtype: 'spbutton',
                    iconCls: 'x-fa fa-print'
//                    text: '프린트',
//                    hidden: me.getHiddenHeaderPrintBtn()
                },

                {
                    xtype: 'spbutton',
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