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
        this.getViewModel().set('regMember', Ext.create('Eui.sample.model.Base', {
            memberFlag: 'S',
            gender: 'F',
            job: ['1','4'],
            company : 'CCMP'
        }));
    },

    onSaveMember: function () {
        var form = this.lookupReference('regform');
        var data = this.getViewModel().get('regMember').getData();
        Util.CommonAjax({
            method: 'POST',
            url: 'resources/data/success.json',
            params: {
                param: data
            },
            pCallback: function (v, params, result) {
                if(result.success){
                    Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
                }else{
                    Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
                }
            }
        });
    }
});
