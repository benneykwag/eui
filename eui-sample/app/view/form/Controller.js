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
        var record = Util.dynamicModel([
            {
                name: "TEXTFIELD",
                type: "string",
                validators: [
                    {
                        type: "length",
                        min: 3,
                        minOnlyMessage: "MSG_ID must have at least 3 characters"
                    },
                    {
                        type: 'euiformat',
                        chkType: 'Ee'
                    }
                ]
            },
            {
                name: 'VALIDATOR_CHK_NUMBER',
                validators: [
                    {
                        type: 'euiformat',
                        chkType: 'N'
                    }
                ]
            }
        ], {
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
        });
        this.getViewModel().set('RECORD', record);
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
