/***
 * eui.grid.Merge에서 사용할 테이블 클래스
 * colspan, rowspan정보가 있다면 실행한다.
 * 이 정보는 eui.grid.Merge클래스에서 모델정보로 전달한다.
 */
Ext.define('eui.ux.table.TableCellMerge', {
    extend: 'Ext.panel.Panel',
    xtype: 'tablecellmerge',
    listeners: {
        afterrender: function () {
            var id = this.table_merge_id;
            var rt = REDIPS.table;
            rt.onmousedown(id, true);
            rt.color.cell = '#9BB3DA';
        }
    },

    layout: 'fit',

    initComponent: function () {
        var id = this.id + '-merge-table';

        this.table_merge_id = id;

        Ext.apply(this, {
            tbar: [
                {
                    xtype: 'button',
                    text: '합치기',
                    iconCls: 'x-fa fa-plus-square',
                    handler: function () {
                        REDIPS.table.merge('h', false);
                        // and then merge cells vertically and clear cells (second parameter is true by default)
                        REDIPS.table.merge('v');
                    }
                },
                {
                    xtype: 'button',
                    text: '가로분할',
                    handler: function () {
                        REDIPS.table.split('h');
                    }
                },
                {
                    xtype: 'button',
                    text: '세로분할',
                    handler: function () {
                        REDIPS.table.split('v');
                    }
                },
                {
                    xtype: 'button',
                    text: '로우추가',
                    handler: function () {
                        REDIPS.table.row(id, 'insert');
                    }
                },
                {
                    xtype: 'button',
                    text: '로우삭제',
                    handler: function () {
                        REDIPS.table.row(id, 'delete');
                    }
                },
                {
                    xtype: 'button',
                    text: '컬럼추가',
                    handler: function () {
                        REDIPS.table.column(id, 'insert');
                    }
                },
                {
                    xtype: 'button',
                    text: '컬럼삭제',
                    handler: function () {
                        REDIPS.table.column(id, 'delete');
                    }
                }
            ],
            html: '<table width="100%" class="table-cell-merge-table" id=' + id + '><tbody>' +
                '<tr height="47"><td></td><td></td><td></td></tr>' +
                '<tr height="47"><td></td><td></td><td></td></tr>' +
                '<tr height="47"><td></td><td></td><td></td></tr>' +
                '</tbody></table>'
        });


        this.callParent(arguments);


    }
})