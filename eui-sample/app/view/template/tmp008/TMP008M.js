Ext.define('Eui.sample.view.template.tmp008.TMP008M', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.TMP008M',

    stores: {
        STORE01: {
            proxy: {
                type: 'ajax',
                //the store will get the content from the .json file
                url: 'resources/data/template/tmp008/data01.json',
                reader: {
                	rootProperty : function(node) {
                        return node.data || node.children;
                    }
                }
            },
            folderSort: true
        },
        STORE02: {
            proxy: {
                type: 'ajax',
                //the store will get the content from the .json file
                url: 'resources/data/template/tmp008/data02.json',
                reader: {
                    rootProperty : function(node) {
                        return node.data || node.children;
                    }
                }
            },
            folderSort: true
        },
        STORE03: {
            proxy: {
                type: 'ajax',
                //the store will get the content from the .json file
                url: 'resources/data/template/tmp008/data02.json',
                reader: {
                    rootProperty : function(node) {
                        return node.data || node.children;
                    }
                }
            },
            folderSort: true
        },
        STORE04: {
            proxy: {
                type: 'ajax',
                //the store will get the content from the .json file
                url: 'resources/data/template/tmp008/data02.json',
                reader: {
                    rootProperty : function(node) {
                        return node.data || node.children;
                    }
                }
            },
            folderSort: true
        }
    }
});