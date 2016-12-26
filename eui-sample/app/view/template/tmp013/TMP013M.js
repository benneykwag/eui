Ext.define('Eui.sample.view.template.tmp013.TMP013M', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TMP013M',
   
    stores: {
        STORE01: {
            autoLoad: true,
            // 페이징 처리 지원.
            fields: [],
            data: [
                {
                    USEPRSN_NM: '홍길동'
                }
            ]
            // 한페이지당 로우수
//            proxy: {
//                type: 'rest',
//                url: '/APPS/template/TMP002S_GRID.do',
//                reader: {
//                    type: 'json',
//                    rootProperty: 'data'
//                }
//            }
        }
    }
});