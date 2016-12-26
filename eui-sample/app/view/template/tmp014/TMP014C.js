Ext.define('Eui.sample.view.template.tmp014.TMP014C', {
    extend: 'eui.mvvm.ViewController',
    alias: 'controller.TMP014C',

    initViewModel: function (vm) {

    },
    onGridSelect: function (grid, record) {
        this.getViewModel().set('RECORD', record);
    },

    gridComboHandler: function () {
        var grid = this.lookupReference('grid');
        var combo = this.lookupReference('codecombo1');
        if(!combo){
            grid.startEditByPosition(0,3)
        }

//        combo.store.getProxy().url = 'resources/data/companys2.json';
        combo.proxyParams = {
            aaa: '1223'
        }
    },

    addRecord: function (grid) {
        console.log(' 콜백처리...', arguments)
        grid.onRowAdd(grid, {
//            job: 'B회사',
//            jobCode: 'BCMP'
        }, 1, function () {    // callback이 필요할 경우 구현한다.
            console.log(' 콜백처리...', arguments)
        });
    }
});