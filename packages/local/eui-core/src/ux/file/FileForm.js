Ext.define('eui.ux.file.FileForm', {
    extend: 'eui.form.Panel',
    xtype: 'fileform',
    frame: true,
    tableColumns: 2,
    height: 50,
    hiddenHeader: true,
    autoScroll: true,
    removeFieldField: function (btn) {
        if (this.addCnt < 2) {
            return;
        }
        this.addCnt = this.addCnt - 1;
        this.remove(btn.up('fieldcontainer').previousSibling());
        this.remove(btn.up('fieldcontainer'));
    },

    addFileField: function () {
        var me = this;
        if (!me.addCnt) {
            me.addCnt = 0;
        }
        me.addCnt = me.addCnt + 1;

        me.add(
            {
                xtype: 'filefield',
                name: 'file',
                hideLabel: true,
                fieldLabel: 'Attachments'
            },
            {
                xtype: 'fieldcontainer',
                width: 43,
                items: [
                    {
                        xtype: 'button',
                        text: '+',
                        listeners: {
                            scope: me,
                            click: 'addFileField'
                        }
                    },
                    {
                        xtype: 'button',
                        text: '-',
                        listeners: {
                            scope: me,
                            click: 'removeFieldField'
                        }
                    }
                ]
            })

    },
    listeners: {
        scope: 'this',
        render: 'addFileField'
    },
    defaults: {
        xtype: 'textfield', //#17
        anchor: '100%',
        labelWidth: 60
    }
})