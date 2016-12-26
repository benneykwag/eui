/***
 * 페이징을 이용한 무한스크롤 그리드
 * 그리드 내부에서 rowadd, delete , update는 지원하지 않으며
 * 폼을 통해 제어해야함.
 */
Ext.define('Eui.sample.view.template.tmp013.TMP013V', {
    extend: 'Ext.panel.Panel',
    xtype: 'TMP013V',
    title: '다중 엑셀 다운로드',
    requires: [
        'Eui.sample.view.template.tmp013.TMP013M',
        'Eui.sample.view.template.tmp013.TMP013V01'
    ],
    viewModel: 'TMP013M',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    tbar: [
        {
            bind: '{STORE01}',
            showExcelDownBtn: true,
            xtype: 'euicommand',
            params: {
                PGMID: 'A000',
                POSIT: '1'
            }
        },
        {
            xtype: 'button',
            text: '다운로드',
            handler: function () {
                var egrid = Ext.ComponentQuery.query('#grid01')[0];
                var egrid2 = Ext.ComponentQuery.query('#grid01')[0];
                var workbook = new Ext.ux.exporter.excelFormatter.Workbook({
                    title: 'workbook sheet',
                    format: 'excel',
                    columns: egrid.columns
                });
                var worksheet1 = new Ext.ux.exporter.excelFormatter.Worksheet(egrid.store, {
                    title: 'first sheet',
                    format: 'excel',
                    columns: egrid.columns
                });
                var worksheet2 = new Ext.ux.exporter.excelFormatter.Worksheet(egrid.store, {
                    title: 'sencond sheet',
                    format: 'excel',
                    columns: egrid2.columns
                });
                workbook.worksheets.push(worksheet1);
                workbook.worksheets.push(worksheet2);
                var data = workbook.render();
                Ext.ux.exporter.FileSaver.saveAs(data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'UTF-8', 'test.xls', null, false,
                    function () {
                        //debugger;
                    },
                    this);
            }
        }
    ],

    items: [
        {
            flex: .5,
            itemId: 'grid01',
            bind: '{STORE01}',
            xtype: 'TMP013V01'
        },
        {
            itemId: 'grid02',
            flex: .5,
            bind: '{STORE01}',
            xtype: 'TMP013V01'
        }
    ]
});