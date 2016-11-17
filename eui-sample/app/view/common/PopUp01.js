Ext.define('Eui.sample.view.common.PopUp01', {
    extend: 'eui.container.PopupContainer',
    alias: 'widget.popup01',
    requires: [

    ],
    defaultListenerScope: true,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    parentCallBack: function (view, record) {
        this.callParent([record])
    },

    onFormSend: function (button) {
        var form = button.up('form'),
            values = form.getForm().getValues(),
            record = Ext.create('Ext.data.Model',values);

        this.parentCallBack(this, record)
    },

    items: [
        {
            tableColumns: 2,
            xtype: 'euiform',
            items: [
                {
                    fieldLabel: '성명',
                    xtype: 'euitext',
                    name: 'NAME'
                },
                {
                    fieldLabel: '영문명',
                    xtype: 'euitext',
                    name: 'ENG_NAME'
                },
                {
                    fieldLabel: '나이',
                    name: 'AGE',
                    xtype: 'euitext'
                },
                {
                    fieldLabel: '주소',
                    xtype: 'euitext',
                    name: 'ADDRR'
                }
            ],
            buttons: [
                {
                    text: '폼값 전달',
                    handler: 'onFormSend'
                }
            ]
        },
        {
            xtype: 'euigrid',
            flex: 1,
            usePagingToolbar: true,
            store: {
                fields: [],
                data: [
                    {
                        NAME: '홍길동',
                        ENG_NAME: 'HONG',
                        AGE: 22,
                        ADDRR: '경기 고양시'
                    },
                    {
                        NAME: '이순신',
                        ENG_NAME: 'LEE',
                        AGE: 56,
                        ADDRR: '전라남도 여수 '
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
                        text: 'NAME',
                        dataIndex: 'NAME'
                    },
                    {
                        text: 'CODE',
                        dataIndex: 'ENG_NAME'
                    },
                    {
                        text: 'AGE',
                        dataIndex: 'AGE'
                    },
                    {
                        text: 'ADDRR',
                        dataIndex: 'ADDRR'
                    }
                ]
            }
        }
    ]
});