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
            title: 'EUI 폼패널',
            tableColumns: 4,
            defaults: {
                hideLabel: true
//                cellCls: 'fo-table-row-td-noneborder'
            },
            items: [
                {
                    xtype: 'euilabel',
                    text: '회원구분'
                },
                {
                    xtype: 'euiradiogroup',
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
                    xtype: 'euilabel',
                    text: '아이디'
                },
                {
                    fieldLabel: '아이디',
                    xtype: 'euitext'
                },
                {
                    xtype: 'euilabel',
                    text: '비밀번호'
                },
                {
                    fieldLabel: '비밀번호',
                    xtype: 'euitext'
                },
                {
                    xtype: 'euilabel',
                    text: '비밀번호 확인'
                },
                {
                    fieldLabel: '비밀번호 확인',
                    xtype: 'euitext'
                },
                {
                    xtype: 'euilabel',
                    text: '성명'
                },
                {
                    fieldLabel: '성명',
                    xtype: 'euitext'
                },
                {
                    xtype: 'euilabel',
                    text: '이메일'
                },
                {
                    fieldLabel: '이메일',
                    allowBlank: false,
                    xtype: 'euitext',
                    vtype: 'email'
                },
                {
                    xtype: 'euilabel',
                    text: '연락처'
                },
                {
                    fieldLabel: '연락처',
                    allowBlank: false,
                    name: 'phone',
                    xtype: 'euitext'
                },
                {
                    xtype: 'euilabel',
                    text: '성별'
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
                    xtype: 'euilabel',
                    text: '체크박스'
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
                    xtype: 'euilabel',
                    text: '생년월일'
                },
                {
                    fieldLabel: '생년월일',
                    xtype: 'euidate'
                },
                {
                    xtype: 'euilabel',
                    text: '회사'
                },
                {
                    fieldLabel: '회사',
                    xtype: 'euicombo'
                }
            ]
        },
        {
            flex: 1,
            xtype: 'euiform',
            frame: true,
            title: 'EUI 폼패널',
            tableColumns: 2,
            defaults: {
                hideLabel: false,
                cellCls: 'fo-table-row-td-noneborder'
            },
            items: [
                {
                    xtype: 'euiradiogroup',
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
                    xtype: 'euicombo'
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