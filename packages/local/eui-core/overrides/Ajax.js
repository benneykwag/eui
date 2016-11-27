/*
 * 기본 ajax 요청관련 기본 설정 수정
 * */
Ext.define('Override.Ajax', {
    override: 'Ext.Ajax',
    _defaultHeaders: {
        'Content-Type': "application/json;charset=utf-8"
    },
    _method: 'POST'
});