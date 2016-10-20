Ext.define('Eui.sample.view.form.ResponsiveForm', {
    extend: 'Ext.panel.Panel',
    xtype: 'sample-resform',
    title: '반응형 폼요소 조절하기.',

    requires: [
        'eui.form.field.TextArea',
        'eui.form.field.HtmlEditor',
        'eui.form.field.Display',
        'eui.form.field.Number',
        'eui.form.field.File',
        'Eui.sample.view.form.CompanyCombo',
        'Eui.sample.view.form.Controller',
        'eui.form.field.ComboBox',
        'eui.form.field.Date',
        'eui.form.CheckboxGroup',
        'eui.form.RadioGroup',
        'eui.form.field.Text'
    ],

    controller: 'sample-form',
    viewModel: {

    },
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
                    bind: '{regMember.userId}',
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
                    bind: '{regMember.userName}',
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
                    colspan: 2,
                    xtype: 'euicheckboxgroup',
                    fieldLabel: 'Two Columns',
                    columns: 6,
                    vertical: true,
                    bind: {
                        value: '{regMember.job}'
                    },
                    defaults: {
                        name: 'job'
                    },
                    items: [
                        { boxLabel: 'Item 1', inputValue: 'A1' },
                        { boxLabel: 'Item 2', inputValue: 'A2'},
                        { boxLabel: 'Item 3', inputValue: 'A3' },
                        { boxLabel: 'Item 4', inputValue: 'A4' },
                        { boxLabel: 'Item 5', inputValue: 'A5' },
                        { boxLabel: 'Item 6', inputValue: 'A6' }
                    ]
                },
                {
                    fieldLabel: '생년월일',
                    xtype: 'euidate'
                },
                {
                    fieldLabel: '회사',
                    xtype: 'companycombo'
                },
                {
                    fieldLabel:'파일',
                    allowBlank: true,
                    xtype:'euifile'
                },
                {
                    fieldLabel:'연봉',
                    bind: '{regMember.payment1}',
                    xtype:'euinumber'
                },
                {
                    xtype:'euidisplay',
                    fieldLabel:'DESC',
                    value:'ddd'
                },
                {
                    fieldLabel: '성명',
                    xtype: 'euitext'
                },
                {
                    height: 150,
                    fieldLabel:'자기소개',
                    xtype:'euihtmleditor'
                },
                {
                    height: 150,
                    fieldLabel:'경력기술',
                    xtype:'euitextarea'
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