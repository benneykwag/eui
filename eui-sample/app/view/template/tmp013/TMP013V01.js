/***
 * 페이징을 이용한 무한스크롤 그리드
 * 그리드 내부에서 rowadd, delete , update는 지원하지 않으며
 * 폼을 통해 제어해야함.
 */
Ext.define('Eui.sample.view.template.tmp013.TMP013V01', {
    extend: 'eui.grid.Panel',
    xtype: 'TMP013V01',

    columns: [
//        {
//            xtype: 'rownumberer'
//        },
        {
            text: '사용자',
            dataIndex: 'USEPRSN_NM'
        }
//        {
//            text: 'To-do List항목',
//            dataIndex: 'ITEM'
//        },
//        {
//            text: '조건',
//            dataIndex: 'CNDT'
//        },
//        {
//            text: '기준일자',
//            dataIndex: 'STD_DT'
//        },
//        {
//            text: '메시지',
//            dataIndex: 'MSG'
//        }
    ]

});