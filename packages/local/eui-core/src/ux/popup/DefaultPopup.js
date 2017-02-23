Ext.define('eui.ux.popup.DefaultPopup', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.defaultpopup',
    defaultListenerScope: true,
    store: {
        proxy: {
            type: 'rest',
            url: 'resources/data/getPopup.json',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    autoScroll: true,

    /***
     *
     */
    beforeRender: function () {
        var me = this,
            popupConfig = this.__PARAMS.popupConfig,
            formConfig = popupConfig.formConfig;

        // formpanel title
        if (this.__PARAMS.popupConfig.title) {
            me.items.items[0].title = this.__PARAMS.popupConfig.title;
        } else {
            me.items.items[0].setHiddenHeader(true);
        }

        Ext.each(formConfig, function (item, idx) {
            // picker value setting
            if(popupConfig.formField == item.name){
                item.value = me.__PARENT.getValue();
            }

            me.items.items[0].add(item)
        });

        if(popupConfig.store||me.store){
            var store = Ext.create('Ext.data.Store',popupConfig.store||me.store);
            me.items.items[1].bindStore(store);
        }

        this.callParent(arguments);
    },

    onSearch: function (type) {
        var me = this,
            grid = me.down('grid'),
            popupConfig = me.__PARAMS.popupConfig;

        grid.store.getProxy().extraParams = {
            groupCode: popupConfig.groupCode
        };

        if (!popupConfig.hiddenColumns) {
            popupConfig.hiddenColumns = [];
        }
        grid.store.load({
            params: me.down('#popup').getForm().getValues(),
            callback: function (records, operation, success) {
                if (Ext.isEmpty(records) || records.length === 0) {
                    return;
                }
                var keys = Object.keys(records[0].getData());
                var columns = [];
                var formFields = [];
                var firstRecord = grid.store.getAt(0);
                var addColumn = function (key, idx) {
                    if (key !== 'id') {
                        if (!Ext.isArray(popupConfig.hiddenColumns)) {
                            popupConfig.hiddenColumns = [popupConfig.hiddenColumns];
                        }

                        var hiddenFlag = Ext.Array.filter(popupConfig.hiddenColumns, function (item) {
                            return item.indexOf(key) != -1;
                        });
                        var langKey = Util.getLocaleValue(key),
                            langSize = 100;
                        if (!firstRecord.get(key)) {
                            return;
                        }
                        if (langKey.length < firstRecord.get(key).length) {
                            langKey = firstRecord.get(key);
                        }
                        if (langKey === 0) {
                            langSize = 200;
                        } else {
                            langSize = langKey.length * 10;
                            if (langSize < 100) {
                                langSize = 100;
                            }
                        }
                        var text;
                        if(popupConfig.columnConfig){
                            text = popupConfig.columnConfig[key];
                        }
                        columns.push({
                            hidden: (hiddenFlag.length === 0) ? false : true,
                            minWidth: langSize,
                            text: text||'#{' + key + '}',
                            dataIndex: key
                        });

                    }
                };
                Ext.each(popupConfig && popupConfig.formConfig || [], function (itm) {
                    formFields.push(itm.name);
                });
                Ext.each(formFields, addColumn);
                Ext.each(formFields, function (itm) {
                    Ext.Array.remove(keys, itm);
                });
                Ext.each(keys, addColumn);
                grid.reconfigure(this.store, columns);
            }
        });
    },

    onLoad: function () {
        if (!this.__PARAMS.popupConfig.autoSearch) {
            return;
        }
        this.onSearch();
    },

    parentCallBack: function (view, record) {
        var trigger = this.__PARENT;
        if(!Ext.isEmpty(trigger) && !Ext.isEmpty(trigger.callBack)){
            Ext.callback(trigger.callBack, trigger, [trigger, record]);
        }

    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [
                {
                    margin: '10 10 5 10',
                    itemId: 'popup',
                    xtype: 'euiform',
                    title: 'TITLE',
                    tableColumns: 2,
                    header: {
                        xtype: 'header',
                        titlePosition: 0,
                        items: [
                            {
                                showReloadBtn: true,
                                showCloseBtn: true,
                                xtype: 'euicommand',
                                listeners: {
                                    reloadbtnclick: 'onSearch'
                                }
                            }
                        ]
                    },
                    listeners: {
                        scope: me,
                        baseformsearch: me.onSearch
                    },
                    //엔터칠때 조회되도록
                    defaults: {
                        listeners: {
                            specialkey: function (field, e) {
                                if (e.getKey() == e.ENTER) {
                                    me.onSearch();
                                }
                            }
                        }
                    }
                },
                {
                    xtype: 'euigrid',
                    margin: '5 10 10 10',
                    flex: 1,
                    usePagingToolbar: true,
//                    bind: {
//                        store: '{commonpopupStore}'
//                    },
                    listeners: {
                        itemdblclick: {
                            fn: me.parentCallBack,
                            scope: me
                        },
                        afterrender: {
                            scope: me,
                            fn: 'onLoad',
                            delay: 500
                        }
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
                }
            ]
        });
        this.callParent(arguments);
        this.on('afterrender', function () {
            var me = this;
        })
    }

});