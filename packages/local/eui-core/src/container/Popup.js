Ext.define('eui.container.Popup', {
    extend: 'eui.container.PopupContainer',
    alias: 'widget.euipopup',
    defaultListenerScope: true,

    listeners: {
        /**
         * 선택된 그리드 로우 세팅,
         */
        enterdblclick: function () {
            var grid = this.down('grid');
            var selectionModel = grid.getSelectionModel(),
                record = selectionModel.getSelection()[0],
                rowIndex = grid.store.indexOf(record);
            grid.fireEvent('itemdblclick', grid, record)
        },
        keydown: function (keycode) {
            var grid = this.down('grid');
            var selectionModel = grid.getSelectionModel(),
                record = selectionModel.getSelection()[0],
                rowIndex = grid.store.indexOf(record),
                condi = (keycode == 40 ? 1 : -1);

            console.log(rowIndex + condi);
            selectionModel.select(rowIndex + condi);
            grid.getView().focusRow(rowIndex + condi);
            this.trigger.focus();
        },
        render: function () {
            var me = this,
                picker = this.ownerCt;
            picker.addListener('show', 'transform', me);
        }
    },

    /***
     * simpleMode에 따라 변형된다.
     */
    transform: function () {
        var me = this,
            grid = this.down('euigrid'),
            searchKeyField = me.popupConfig.searchKeyField;
        var simpleMode = this.ownerCt.simpleMode;
        if (simpleMode) {
            grid.setMargin(0);
            me.down('euiform').setHidden(true);
            grid.reconfigure(grid.store, me.popupConfig.simpleColumns);

            grid.hideHeaders = true;
            grid.updateHideHeaders();
            grid.store.getProxy().extraParams[searchKeyField] = me.trigger.getValue();
            grid.store.load();
            if (!me.popupConfig.multiSelect) {
                me.down('toolbar').setHidden(true);
            }
        } else {
            grid.setMargin(5);
            me.down('euiform').setHidden(false);
            if (!me.popupConfig.multiSelect) {
                me.down('toolbar').setHidden(false);
            }
            grid.reconfigure(grid.store, me.popupConfig.normalColumns);
            grid.hideHeaders = false;
            grid.updateHideHeaders();
            grid.store.getProxy().extraParams[searchKeyField] = me.trigger.previousSibling().getValue();
            grid.store.load();
            me.ownerCt.setHeight(me.popupConfig.height);
        }
    },

    parentCallBack: function (view, record) {
        this.callParent([record]);
        this.fireEvent('popupclose');
    },

    onMultiRecordSet: function () {
        var grid = this.down('grid'),
            selmodel = grid.getSelectionModel(),
            selection = selmodel.getSelection();
        if (selection.length == 0) {
            return;
        }

        this.parentCallBack(grid, selection);
    },

    onFormSend: function (button) {
        var form = button.up('form'),
            values = form.getForm().getValues(),
            record = Ext.create('Ext.data.Model', values);

        this.parentCallBack(this, record)
    },

    defaults: {
        margin: 5
    },

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    onSearch: function () {
        var form = this.down('form'),
            values = form.getForm().getValues(),
            grid = this.down('grid'),
            extraParams = grid.store.getProxy().getExtraParams();
        extraParams['page'] = 1;
        extraParams['start'] = 0;
        Ext.apply(extraParams, values);
        grid.store.load();
    },

    initComponent: function () {
        var me = this,
            config = me.popupConfig,
            items = [],
            store = {
                type: 'buffered',
                remoteSort: true,
                fields: [],
                leadingBufferZone: 50,
                pageSize: 50,
                proxy: {
                    type: 'rest',
                    url: config.proxyUrl,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            };


        var grid = {
            xtype: 'euigrid',
            flex: 1,
            selModel: {
                pruneRemoved: false
            },
            store: store,
            listeners: {
                itemdblclick: 'parentCallBack'
            },
            forceFit: true,
            columns: {
                defaults: {
                    width: 120
                },
                items: [
                    {
                        text: '-',
                        dataIndex: 'temp'
                    }
                ]
            }
        };
        if (me.popupConfig.formConfig) {
            Ext.apply(me.popupConfig.formConfig, {
                header: {
                    xtype: 'header',
                    titlePosition: 0,
                    items: [
                        {
                            xtype: 'button',
                            handler: 'onSearch',
                            iconCls: 'fa fa-search',
                            text: '검색'
                        }
                    ]
                },
                defaults: {
                    listeners: {
                        specialkey: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                me.onSearch(field);
                            }
                        }
                    }
                }
            });
            items.push(me.popupConfig.formConfig);
        }
        if (me.popupConfig.multiSelect) {
            Ext.apply(grid, {
                selModel: {     // 그리로우를 클릭시 체크박스를 통해 선택되며 체크와 체크해제
                    mode: 'SIMPLE',
                    selType: 'checkboxmodel'
                }
            })
        }

        items.push(grid);

        items.push({
            ui: 'plain',
            xtype: 'toolbar',
            items: [
                '->',
                {
                    width: 100,
                    iconCls: 'fa fa-thumb-tack',
                    xtype: 'euibutton',
                    handler: 'onMultiRecordSet',
                    text: '확인'
                },
                '->'
            ]
        })
        Ext.apply(me, {
            items: items
        });
        this.callParent(arguments);
    }
});