Ext.define('Eui.sample.view.template.tmp010.TMP010C', {
    extend: 'eui.mvvm.ViewController',
    alias: 'controller.TMP010C',

    initViewModel: function (vm) {
        vm.set('FORMRECORD', Ext.create('Ext.data.Model',{
            NAME : '홍길동',
            ENG_NAME : 'HONG GIL DONG',
            AGE : '25세',
            ADDRR : '경기 고양시 ',
            ZIPCODE: '12012',
            ADDRESS1: '서울특별시 동작구 ',
            ADDRESS2: '동작 아파트 101동 3201호'
        }))
    },

    setPopupValues: function (trigger, record, valueField, displayField) {
        var formrecord = this.getViewModel().get('FORMRECORD');
        formrecord.set(record.getData());
        formrecord.set('DESC', record.get('NAME') + '('+ record.get('ENG_NAME') +')'+ record.get('AGE') + record.get('ADDRR'));
    }
});