/***
 * 페이징을 이용한 무한스크롤 그리드
 * 그리드 내부에서 rowadd, delete , update는 지원하지 않으며
 * 폼을 통해 제어해야함.
 */
Ext.define('Eui.sample.view.template.tmp014.TMP014V01', {
    extend: 'eui.grid.Panel',
    xtype: 'TMP014V01',
//    defaultListenerScope: true,
    plugins: {
        ptype: 'cellediting',   // 셀에디터를 추가.
        clicksToEdit: 2
    },

    tbar: [
        {
            xtype: 'textfield',
            bind: '{formStatus.dirty}'
        }
    ],
    listeners: {
        select: 'onGridSelect'
    },

    columns: [
        {
            text: 'NAME',
            dataIndex: 'name',
            editor: {
                bind: {
                    disabled: '{!formStatus.phantom}'
                },
                xtype: 'textfield'
            }
        },
        {
            text: 'AGE',
            dataIndex: 'age',
            editor: {
                xtype: 'textfield'
            }
        },
        {
            text: 'AGE',
            dataIndex: 'jobCode'
        },
        {
            text: 'JOB',
            dataIndex: 'job',
            editor: {
                xtype: 'euicombo',
                reference: 'codecombo1',
                valueColumnDataIndex : 'jobCode',
                displayField: 'name',
                valueField: 'code',
                setProxyParams: function () {
                    return {
                        agdasg: '0000',
                        aaa: '111'
                    }
                },
                proxyUrl : 'resources/data/companys.json',
                groupCode: 'A00'
            }
        }
    ]

});