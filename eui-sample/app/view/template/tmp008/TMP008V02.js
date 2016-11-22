Ext.define('Eui.sample.view.template.tmp008.TMP008V02', {
    extend: 'eui.form.Panel',
    xtype: 'TMP008V02',
    title: ' DETAIL',
    tableColumns: 2,
    items: [
        {
            fieldLabel: '코드',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field1}'
        },
        {
            fieldLabel: '코드명',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field2}'
        },
        {
            fieldLabel: '센서명',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field3}'
        },
        {
            fieldLabel: '사용기간',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field4}'
        },
        {
            fieldLabel: '위치',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field5}'
        },
        {
            fieldLabel: '책임자',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field6}'
        },
        {
            colspan: 2,
            fieldLabel: '개요',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field7}'
        },
        {
            fieldLabel: '담당사업자',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field8}'
        },
        {
            fieldLabel: '집행자원',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field9}'
        },
        {
            fieldLabel: 'PM',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field10}'
        },
        {
            fieldLabel: '공무',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field11}'
        },
        {
            fieldLabel: '설계자',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field12}'
        },
        {
            fieldLabel: '감리자',
            xtype: 'euitext',
            bind: '{MASTERRECORD.field13}'
        },
        {
            fieldLabel: '계약명',
            xtype: 'euitext'
        },
        {
            fieldLabel: '형태',
            xtype: 'euitext'
        },
        {
            fieldLabel: '금액',
            xtype: 'euitext'
        },
        {
            fieldLabel: '총액',
            xtype: 'euitext'
        },
        {
            fieldLabel: '발주처',
            xtype: 'euitext'
        },
        {
            fieldLabel: '수요처',
            xtype: 'euitext'
        },
        {
            fieldLabel: '당사지분율',
            xtype: 'euitext'
        },
        {
            xtype: 'euidisplay'
        },
        {
            xtype: 'container',
            colspan: 2,
            items: [
                {
                    flex:1,
                    xtype: 'grid',
                    title: '공동회사',
                    margin: 5,
                    height: 150,
                    forceFit: true,

                    bind: {
                        store: '{STORE02}'
                    },
                    columns: [
                        {
                            xtype: 'rownumberer'
                        },
                        {
                            text: '사업자번호',
                            dataIndex: 'field1'
                        },
                        {
                            text: '회사명',
                            dataIndex: 'field2'
                        },
                        {
                            text: '지분율(%)',
                            dataIndex: 'field3'
                        }
                    ]
                }

            ]
        }

    ]

});