Ext.define('Eui.sample.view.template.tmp005.TMP005C', {
    extend: 'eui.mvvm.ViewController',
    alias: 'controller.TMP005C',

    initViewModel: function (viewmodel) {
        viewmodel.set('RECORD', new Ext.data.Model());
    },
    
    onUseChange : function(check, rowIndex, checked, record){
        var tree = this.lookupReference('tree'),
            store = tree.getRootNode();
//        debugger;
//        if(record.get('USE_YN') == 'Y'){
            record.fireEvent('recusivechildcheck', record, 'USE_YN');
//        }

//        var c = rn.findChild("text","Also ASP.net",true);
//        c.expand();
    },
    
    onRightGridLoad: function(grid, record, item){
    	  var grid = this.lookupReference('rightGrid'),
    	  cmpKey = record.get('USE_YN')
      grid.store.load({
          params: {
              cmpKey: cmpKey
          }
      });
    },

    onLoadData: function () {
        var me = this;
        var grid = this.lookupReference('tree');
        grid.store.load({
            params: {
            }
        });

//        Util.CommonAjax({
//            method: 'GET',
//            url: 'TMP004S_FORM.do',
//            params:  {
//
//            },
//            pCallback: function (v, params, result) {
//                if (result.success) {
//                    me.getViewModel().set('RECORD', new Ext.data.Model(
//                        result.data[0]
//                    ));
//                } else {
//                    Ext.Msg.alert('실패', result.message);
//                }
//            }
//        });
    },

    onSave: function () {
        // 저장 로직.
        var data = this.vm.get('RECORD').getData()

        Ext.Msg.show({
            title: '확인',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '저장하시겠습니까?',
            fn: function (btn) {
                if (btn === 'yes') {
                    Util.CommonAjax({
                        method: 'POST',
                        url: 'TEMP004W.do',
                        params:  data,
                        pCallback: function (v, params, result) {
                            if (result.success) {
                                Ext.Msg.alert('저장성공', result.message);
                            } else {
                                Ext.Msg.alert('저장실패', result.message);
                            }
                        }
                    });
                }
            }
        });
    }
});