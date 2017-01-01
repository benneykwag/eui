Ext.define('Eui.sample.view.form.Combo',{
    extend: 'Ext.panel.Panel',
    xtype: 'sample-combo',
    title : 'Combo',
    defaults: {
        margin: 5
    },
    defaultListenerScope: true,
    viewModel: {

    },
    listeners: {
        render: 'setRecord'
    },

    setRecord: function () {
        this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
            CHECKBOX1 : 'Y',
            RADIOGROUP: 'A',
            MONTHFIELD : '2011.09',
            DATEFIELD : '2011.09.22',
            TEXTFIELD: '텍스트',
            COMBOBOX01 : 'VW',
            COMBOBOX02 : 'MICROSOFT',
            CHECKBOXGROUP: ['KOREA','JAPAN','USA','RUSIA'],
            BIGTEXT: 'AAAA',
            NUMBER01 : 1100090
        }));
    },

    items: [
        {
            xtype: 'euiform',
            title: '단일 콤보',
            items: [
//                {
//                    fieldLabel: '기본콤보',
//                    xtype: 'euicombo',
//                    proxyUrl : 'resources/data/companys.json',
////                    proxyUrl : 'companys.do',
//                    displayField: 'name',
//                    valueField: 'code',
//                    groupCode: 'A001',
//                    value: 'MICROSOFT',
//                    bind: '{RECORD.COMBOBOX02}'
//                },
//                {
//                    fieldLabel: '기본콤보',
//                    groupCode: 'A001',
//                    value: 'MICROSOFT',
//                    xtype: 'companycombo'
//                },
                {
                    fieldLabel: '콤보박스 TYPE2',
                    xtype: 'euicombo',
                    proxyUrl : 'resources/data/companys.json',
                    displayField: 'name',
                    valueField: 'code',
                    groupCode: 'A001',
                    bind: '{RECORD.COMBOBOX02}'
                    /*proxyParams : {
                        myParam1: '1',
                        myParam2: 'AA'
                    }*//*,
                    setProxyParams: function () {
                        return {
                            add: 'aaa'
                        }
                    }*/
                }/*,
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
                },*/
            ]
        }
    ]
})