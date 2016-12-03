Ext.define('Eui.sample.view.common.PopUp02', {
    extend: 'eui.container.PopupContainer',
    alias: 'widget.popup02',
    requires: [

    ],
    defaultListenerScope: true,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    parentCallBack: function (view, record) {
        this.callParent([record]);
        this.ownerCt.hide();
    },

    onFormSend: function (button) {
        var form = button.up('form'),
            values = form.getForm().getValues(),
            record = Ext.create('Ext.data.Model',values);

        this.parentCallBack(this, record)
    },

    items: [
        {
            xtype: 'euigrid',
            flex: 1,
            usePagingToolbar: true,
            store: {
                fields: [],
                data: [
                    {
                        ZIPCODE: '9099',
                        ADDRESS1 : '서울시 천호동',
                        ADDRESS2 : '주공 101'
                    },
                    {
                        ZIPCODE: '9099',
                        ADDRESS1 : '서울시 전농동',
                        ADDRESS2 : '주공 109'
                    },
                    {
                        ZIPCODE: '8754',
                        ADDRESS1 : '서울시 구로구',
                        ADDRESS2 : '주공 104'
                    }
                ]
            },
            listeners: {
                itemdblclick: 'parentCallBack',
                afterrender: {
//                    scope: me,
//                    fn: 'onLoad',
//                    delay: 500
                }
            },
            forceFit: true,
            columns: {
                defaults: {
                    width: 120
                },
                items: [
                    {
                        text: 'ZIPCODE',
                        dataIndex: 'ZIPCODE'
                    },
                    {
                        text: 'ADDRESS1',
                        dataIndex: 'ADDRESS1'
                    },
                    {
                        text: 'ADDRESS2',
                        dataIndex: 'ADDRESS2'
                    }
                ]
            }
        }
    ]
});