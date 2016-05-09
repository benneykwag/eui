Ext.define('Eui.sample.view.form.Panel', {
    extend: 'Ext.panel.Panel',
    xtype: 'sample-form',
    title: 'EUI 사용하기',
    requires: [
        'eui.form.field.ComboBox',
        'eui.form.field.Date',
        'eui.form.CheckboxGroup',
        'eui.form.RadioGroup',
        'eui.form.field.Text'
    ],
    viewModel: {},
    defaults: {
        margin: 5
    },

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    items: [
        {
            flex: 1,
            xtype: 'euiform',
            frame: true,
            title: 'EUI 폼',
            tableColumns: 2,
            defaults: {
                allowBlank: false
            },
            items: [
                {
                    xtype: 'euiradiogroup',
                    allowBlank: false,
                    fieldLabel: '회원구분',
                    items: [
                        {
                            boxLabel: '일반',
                            checked: true,
                            inputValue: 'N'
                        },
                        {
                            boxLabel: '법인 관리자',
                            inputValue: 'S'
                        }
                    ],
                    bind: {
                        value: '{regMember.memberFlag}'
                    }
                },
                {
                    allowBlank: true,
                    fieldLabel: '아이디',
                    xtype: 'euitext'
                },
                {
                    fieldLabel: '비밀번호',
                    xtype: 'euitext'
                },
                {
                    fieldLabel: '비밀번호 확인',
                    xtype: 'euitext'
                },
                {
                    fieldLabel: '성명',
                    xtype: 'euitext'
                },
                {
                    fieldLabel: '이메일',
                    allowBlank: false,
                    xtype: 'euitext',
                    vtype: 'email'
                },
                {
                    fieldLabel: '연락처',
                    allowBlank: false,
                    name: 'phone',
                    xtype: 'euitext'
                },
                {
                    xtype: 'euiradiogroup',
                    fieldLabel: '성별',
                    bind: {
                        value: '{regMember.gender}'
                    },
                    items: [
                        {
                            boxLabel: '남성',
                            inputValue: 'M'
                        },
                        {
                            boxLabel: '여성',
                            inputValue: 'F'
                        }
                    ]
                },
                {
                    colspan: 3,
                    xtype: 'euicheckboxgroup',
                    fieldLabel: 'Two Columns',
                    columns: 6,
                    vertical: true,
                    bind: {
                        value: '{regMember.rb}'
                    },
                    items: [
                        { boxLabel: 'Item 1', name: 'rb', inputValue: '1' },
                        { boxLabel: 'Item 2', name: 'rb', inputValue: '2'},
                        { boxLabel: 'Item 3', name: 'rb', inputValue: '3' },
                        { boxLabel: 'Item 4', name: 'rb', inputValue: '4' },
                        { boxLabel: 'Item 5', name: 'rb', inputValue: '5' },
                        { boxLabel: 'Item 6', name: 'rb', inputValue: '6' }
                    ]
                },
                {
                    fieldLabel: '생년월일',
                    xtype: 'euidate'
                },
                {
                    fieldLabel: '회사',
                    editable: true,
                    xtype: 'euicombo'
                }
            ],
            buttons: [
                {
                    text: '확인',
                    formBind: true
                },
                {
                    text: '취소'
                }
            ]
        }
//        {
//            flex:1,
//            xtype: 'form',
//            frame:true,
//            title: 'Ext.form.Panel',
//            layout: {
//                type: 'table',
//                columns: 2,
//                tableAttrs: {
//                    style: {
//                        width: '100%'
//                    }
//                }
//            },
//            items: [
//                {
//                    fieldLabel:'이름',
//                    xtype:'textfield'
//                },
//                {
//                    fieldLabel:'이름',
//                    xtype:'textfield'
//                }
//            ]
//        }
    ]
})