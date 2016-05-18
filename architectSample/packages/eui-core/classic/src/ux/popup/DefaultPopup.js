Ext.define('eui.ux.popup.DefaultPopup', {
    extend: 'eui.container.PopupContainer',
    alias: 'widget.popup-default',
    requires: [

    ],
    viewModel: {
        stores: {
            commonpopupStore: {
                autoLoad: true,
                remoteSort: true,
                fields: [],
                proxy: {
                    type: 'rest',
                    url: 'api/COM050101SVC/getPopup',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            }
        }
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    autoScroll: true,

    setCallbackData: function () {
        console.log(this);
        var record = Ext.create('Ext.data.Model', {
            CD: 'AAAA',
            CD_NM: '코드명'
        });
        this.parentCallBack(record, 'CD', 'CD_NM');
        this.up('window').close();
    },

    /***
     *
     */
    beforeRender: function () {
        var me = this,
            formConfig = this.__PARAMS.popupConfig.formConfig,
            length = formConfig.length,
            tableColumns = me.items.items[0].tableColumns,
            colspan = (length * 2) % tableColumns == 0 ? 0 : ((tableColumns + 1) - (length * 2) % tableColumns);

        // formpanel title
        if (this.__PARAMS.popupConfig.title) {
            me.items.items[0].title = this.__PARAMS.popupConfig.title;
        } else {
            me.items.items[0].setHiddenHeader(true);
        }

        Ext.each(formConfig, function (item, idx) {
            me.items.items[0].add({
                    xtype: 'euilabel',
                    text: item.label
                },
                Ext.apply(item, {colspan: (idx === (length - 1) ? colspan : 0)})
            )
        });
        this.callParent(arguments);
    },

    onSearch: function (type) {
        var me = Util.getOwnerCt(this).down('sppopupcontainer'),
            grid = me.down('spgrid'),
            popupConfig = me.__PARAMS.popupConfig;

        if(type == "S"){	//시작은 sql이 우선
//            var sql = Ext.apply(Util.getOwnerCt(me).down('spform').getValues(), popupConfig.sql);
        }else{
//            var sql = Ext.apply(popupConfig.sql, Util.getOwnerCt(me).down('spform').getValues()); //팝업은 검색조건이 우선시됨 JKM
        }

//        if (!Ext.isEmpty(popupConfig.addSearchOption)) {
//            Ext.each(popupConfig.addSearchOption, function (field, idx) {
//
////                var search = '[searchId=' + field.searchId + ']';
////                var value = field.reqValue;
////                if (!value) {
////                    value = Util.getOwnerCt(me.__PARENT).down(search).getSubmitValue();
////                }
////                if (sql) {
////                    sql[(field.reqName ? field.reqName : field.searchId)] = value;
////                }
//            });
//        }

        grid.store.getProxy().extraParams = {
            groupCode: popupConfig.groupCode
        };

        if (!popupConfig.hiddenColumns) {
            popupConfig.hiddenColumns = [];
        }
        grid.store.load({
//            params: me.down('#popup').getForm().getValue(),
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
                        columns.push({
//                            hidden: (hiddenFlag.length === 0) ? false : true,
                            minWidth: langSize,
                            text: '#{' + key + '}',
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
        this.onSearch('S');
    },

    parentCallBack: function (view, record) {
        this.callParent([record])
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [
                {
                    tableColumns: 4,
                    hiddenCloseBtn: false,
                    hiddenHeader: true,
                    itemId: 'popup',
                    xtype: 'spform',
                    hiddenSearchBtn: false,
                    listeners: {
                        scome: me,
                        baseformsearch: me.onSearch
                    }
                },
                {
                    xtype: 'spgrid',
                    flex: 1,
                    usePagingToolbar: true,
                    bind: {
                        store: '{commonpopupStore}'
                    },
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