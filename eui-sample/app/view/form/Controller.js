Ext.define('Eui.sample.view.form.Controller', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.sample-form',

    listen: {
        component: {
            'sample-form': {
                render: 'setRecord'
            }
        }
    },

    setRecord: function () {
        this.getViewModel().set('RECORD', Ext.create('Eui.sample.model.Base', {
            CHECKBOX1 : 'N',
            RADIOGROUP: 'A',
            MONTHFIELD : '2011.09',
            DATEFIELD : '2011.09.22',
            TEXTFIELD: '텍스트',
//            userId: 'eui',
//            userName: '이유아이',
//            gender: 'F',
            CHECKBOXGROUP: ['KOREA','JAPAN','USA','RUSIA']
//            payment1: 120011000,
//            company: 'CCMP'
        }));
    },

    onSaveMember: function () {
        var form = this.lookupReference('regform');
//        form.getForm().submit({
//            url : 'aa'
//        });
        var data = this.getViewModel().get('RECORD').getData();
        Util.CommonAjax({
            method: 'POST',
            url: 'resources/data/success.json',
            params: {
                param: data
            },
            pCallback: function (v, params, result) {
                if (result.success) {
                    Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
                } else {
                    Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
                }
            }
        });
    },

    checkBoxgroupAllCheck: function () {
        var ckg = this.lookupReference('euicheckboxgroup01');
        ckg.setValue(['A1','A2','A3','A4','A5'])
    },

    checkBoxgroupAllUnCheck: function () {
        var ckg = this.lookupReference('euicheckboxgroup01');
        ckg.setValue()
    },

    /***
     * 라디오 그룹을 변경한다.
     * @param combo
     * @param record
     */
    setRadioGroup: function (combo, record) {
        var rg = this.lookupReference('euiradiogroup');
        rg.setValue(record.get(combo.valueField))
    }
});
