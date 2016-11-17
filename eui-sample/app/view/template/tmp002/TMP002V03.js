Ext.define('Eui.sample.view.tmp002.TMP002V03', {
    extend: 'eui.form.Panel',
    xtype: 'TMP002V03',
    margin: 5,
    tableColumns: 1,
    viewModel: {
        radioValue222: {
            bind: '{customerRecord.field5}',
            get: function (value) {
                return {
                    field5: value
                };
            }
        }
    },
    items: [

        {
            xtype: 'euitext',
            fieldLabel: '사용자',
            bind: '{customerRecord.USEPRSN_NM}'
        },
        {
            fieldLabel: 'To-do List항목',
            xtype: 'euitext',
            bind: '{customerRecord.ITEM}'
        },
        {
        	allowBlank: false,
            fieldLabel: '내용',
            xtype: 'euitext',
            bind: '{customerRecord.CNDT}'
        },
        {
            fieldLabel: '기준일자',
            xtype: 'euitext',
            bind:'{customerRecord.STD_DT}'
        },
        {
            fieldLabel: '결과',
            xtype: 'euitextarea',
            bind: '{customerRecord.MSG}'
        },
        {
            fieldLabel: '방문여부',
            xtype: 'euiradiogroup',
            defaults: {
                name: 'field6'
            },
            items: [
                {
                    boxLabel: '방문',
                    inputValue: 'I'
                },
                {
                    boxLabel: '약속취소',
                    inputValue: 'S'
                },
                {
                    boxLabel: 'No-Show',
                    inputValues: 'N'
                }
            ],
            bind: {
                value: '{customerRecord.field6}'
            }
        }

    ],
    listeners: {
    },
    bbar: [
        '->',
        {
            xtype: 'euibutton',
            text: '저장',
            formBind: true,
            iconCls: '#{저장아이콘}',
            handler: 'onSaveForm'
        },
        {
            xtype: 'euibutton',
            iconCls: '#{행삭제아이콘}',
            bind: {
                disabled: '{formStatus.phantom}'
            },
            text: '#{행삭제}',
            handler: 'onDelFormRecord'
        },
        {
            xtype: 'euibutton',
            text: '닫기',
            iconCls: 'x-fa fa-sign-out',
            listeners: {
                click: function () {
                    var window = Util.getOwnerCt(this);
                    if (Util.getOwnerCt(this).xtype === 'window') {
                        window.close();
                    }
                }
            }
        }
    ]
})