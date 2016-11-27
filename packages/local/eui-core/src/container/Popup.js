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
            searchKeyField = me.ownerCt.ownerCmp.searchKeyField;
        var simpleMode = this.ownerCt.simpleMode;
        if (simpleMode) {
            grid.setMargin(0);
            me.down('euiform').setHidden(true);
            grid.reconfigure(grid.store, me.simpleColumns);

            grid.hideHeaders = true;
            grid.updateHideHeaders();
            grid.store.getProxy().extraParams[searchKeyField] = me.trigger.getValue();
            grid.store.load();
            if (!me.multiSelect) {
                me.down('toolbar').setHidden(true);
            }


        } else {
            grid.setMargin(5);
            me.down('euiform').setHidden(false);
            if (!me.multiSelect) {
                me.down('toolbar').setHidden(false);
            }
            grid.reconfigure(grid.store, me.normalColumns);
            grid.hideHeaders = false;
            grid.updateHideHeaders();
            grid.store.getProxy().extraParams[searchKeyField] = me.trigger.previousSibling().getValue();
            grid.store.load();
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
        if(selection.length == 0){
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

    initComponent: function () {
        var me = this,
            config = me.popupConfig,
            items = [],
            grid = {
                xtype: 'euigrid',
                flex: 1,
                selModel: {
                    pruneRemoved: false
                },
                store: me.store,
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
        if (me.formConfig) {
            items.push(me.formConfig);
        }
        if (me.multiSelect) {
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