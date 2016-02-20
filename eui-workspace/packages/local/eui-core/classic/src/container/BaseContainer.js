/***
 * 이 컨테이너는 프로그램(각 모듈)의 최상단에 위치해 프로그램을
 * 배치하는 용도로 사용된다.
 * 모든 프로그램 모듈은 이 컨테이너를 확장해 작성한다.
 * 모든 팝업은 호출즉시 특이사항이 없는 경우 이 컨테이너의 자식으로 추가된다.
 */
Ext.define('eui.container.BaseContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.spbasecontainer',
    mixins: [
//        'com.ux.mixin.BaseContainer'
    ],
    scrollable: 'y',
    layout: {
        type :'vbox',
        align: 'stretch'
    },
    style: {
        'background-color': 'white'
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});