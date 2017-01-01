Ext.define('Eui.sample.view.form.Panel', {
    extend: 'eui.panel.BasePanel',
    xtype: 'sample-form',
    title: 'EUI 사용하기',

    requires: [
        'eui.ux.field.plugin.Clearable',
        'eui.form.field.Month',
        'eui.form.field.Checkbox',
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
        'eui.form.field.Text',
        'eui.form.field.PopUpPicker'
    ],
    controller: 'sample-form',
    viewModel: {

    },
    defaults: {
        margin: 5
    },
    layout: 'auto',
    items: [
        {
            flex: 1,
            reference: 'regform',
            xtype: 'euiform',
            title: 'EUI 폼',
            tableColumns: 2,
            defaults: {
                allowBlank: false
            },
            items: [
                {
                    fieldLabel : '파일업로드',
                    xtype: 'euifieldcontainer',
                    items: [
                        {
                            xtype: 'button',
                            width: 150,
                            text: '파일업로드',
                            handler: function () {
                                Util.callFileManager({
                                    REF_NO: '11',
                                    S_FUNC_CODE: "CO",
                                    REF_TYPE : 'CU'
                                })
                            }
                        },
                        {
                            xtype: 'button',
                            width: 150,
                            text: '파일업로드(CSV)',
                            handler: function () {
                                var uploader = Util.callExcelUploader({
                                    url : 'resources/data/success.json',
                                    params: {
                                        gubun: '111'
                                    }
                                });
                                uploader.on('complete', function (upd, data) {
                                    upd.close();
                                    console.log(data);
                                });
                                uploader.on('fail', function (upd, data) {

                                })
                            }
                        }
                    ]
                },

                {
                    fieldLabel: '체크박스',
                    xtype: 'euicheckbox',
                    listeners: {
                        change: function (c, newValue, oldValue) {
                            console.log('체크박스', c.rendered, newValue, oldValue)
                        }
                    },
                    bind: '{RECORD.CHECKBOX1}'
                },
                {
                    xtype: 'euicheckboxgroup',
                    fieldLabel: '체크박스그룹',
                    columns: 4,
                    reference: 'euicheckboxgroup01',
                    bind:'{RECORD.CHECKBOXGROUP}',
                    defaults: {
                        name: 'CHECKBOXGROUP'
                    },
                    items: [
                        { boxLabel: '한국', inputValue: 'KOREA' },
                        { boxLabel: '일본', inputValue: 'JAPAN'},
                        { boxLabel: '미국', inputValue: 'USA' },
                        { boxLabel: '러시아', inputValue: 'RUSIA' }
                    ]
                },
                {
                    xtype: 'euiradiogroup',
                    reference: 'euiradiogroup',
//                    allowBlank: false,
                    fieldLabel: '라디오그룹',
                    items: [
                        {
                            boxLabel: 'INPUTVALUE: A',
                            inputValue: 'A'
                        },
                        {
                            boxLabel: 'INPUTVALUE: B',
                            inputValue: 'B'
                        }
                    ],
                    bind: '{RECORD.RADIOGROUP}'
                },
                {
                    fieldLabel: '월달력',
                    xtype: 'monthfield',
                    bind: '{RECORD.MONTHFIELD}'
                },
                {
                    fieldLabel: '달력',
                    xtype: 'euidate',
                    bind: '{RECORD.DATEFIELD}'
                },
                {
                    fieldLabel: '텍스트',
                    xtype: 'euitext',
                    bind: '{RECORD.TEXTFIELD}'
                },
                {
                    fieldLabel: '비밀번호2',
                    plugins: [{
                        ptype: 'clearable'
                    }],
                    xtype: 'euitext',
                    inputType: 'password',
                    bind: '{RECORD.TEXTFIELD}'
                },
                {
                    fieldLabel: '콤보박스 TYPE1',
                    xtype: 'euicombo',
                    displayField: 'name',
                    valueField: 'code',
                    store: {
                        data: [
                            {
                                name: '아우디',
                                code: 'AUDI'
                            },
                            {
                                name: '벤츠',
                                code: 'BENZ'
                            },
                            {
                                name: 'BMW',
                                code: 'BMW'
                            },
                            {
                                name: '폭스바겐',
                                code: 'VW'
                            }
                        ]
                    },
                    bind: '{RECORD.COMBOBOX01}'
                },
                {
                    fieldLabel: '콤보박스 TYPE2',
                    xtype: 'euicombo',
                    proxyUrl : 'resources/data/companys.json',
                    displayField: 'name',
                    valueField: 'code',
                    groupCode: 'A001',
                    bind: '{RECORD.COMBOBOX02}'
                },
                {
                    fieldLabel: '콤보박스 TYPE2이후 연결',
                    xtype: 'euicombo',
                    proxyUrl : 'resources/data/companys.json',
                    displayField: 'name',
                    valueField: 'code',
                    groupCode: 'A003',
                    // 파라메터 : A001(RECORD.COMBOBOX02를 사용하는 콤보값을 사용한다.)
                    relBindVars :['RECORD.COMBOBOX02|A001'],
                    bind: '{RECORD.COMBOBOX03}'
                },
                {
                    fieldLabel : '숫자필드',
                    xtype: 'euinumber',
                    bind: '{RECORD.NUMBER01}'
                },
                {
                    fieldLabel:'파일',
                    allowBlank: true,
                    xtype:'euifile'
                },
                {
                    colspan: 2,
                    height: 150,
                    fieldLabel:'euitextarea',
                    xtype:'euitextarea'
                },
                {
                    colspan: 2,
                    bindVar : {
                        ZIPCODE : '{RECORD.ZIPCODE}',
                        ADDRESS1 : '{RECORD.ADDRESS1}',
                        ADDRESS2 : '{RECORD.ADDRESS2}'
                    },
                    xtype: 'addressfield'

                },
                {
                    colspan: 2,
                    bind: {
                        rawValue: '{RECORD.BIGTEXT}'
                    },
                    fieldLabel: 'tinymcetextarea',
                    xtype: 'tinymcetextarea'
                }
            ],
            buttons: [
                {
                    reference : 'radioValue',
                    width: 150,
                    xtype: 'euicombo',
                    displayField: 'name',
                    valueField: 'code',
                    value: 'A',
                    listeners: {
                        select: 'setRadioGroup'
                    },
                    store: {
                        data: [
                            {
                                name: 'INPUTVALUE A',
                                code: 'A'
                            },
                            {
                                name: 'INPUTVALUE B',
                                code: 'B'
                            }
                        ]
                    }
                },
                {
                    text: '체크박스그룹 전체 체크',
                    handler:'checkBoxgroupAllCheck'
                },
                {
                    text: '체크박스그룹 전체 체크',
                    handler: 'checkBoxgroupAllUnCheck'
                },
                {
                    text: '확인',
                    formBind: true,
                    handler: 'onSaveMember'
                },
                {
                    text: '취소'
                }
            ]
        }
    ]
})