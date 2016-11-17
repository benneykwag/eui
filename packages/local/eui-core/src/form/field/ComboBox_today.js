Ext.define('eui.form.field.ComboBox_today', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.spcombotoday',

    requires: [
        'Util',
        "eui.form.field.ComboBoxController"
    ],
    controller: 'spcombo',
    /***
     * 요구 정의.
     * 1. groupCode를 설정해 해당 코드를 가져온다.
     * 2. 폼필드와 연계되어 해당 폼필드의 변경사항이 있을 경우
     *      재로드한다.
     * 3. queryMode : 'local'을 지정할 경우 내부 필터링된다.
     *      이경우에도 연계된 폼필드가 있고 변경사항이 있다면
     *      재로드해야한다.
     */
    /// 기본 설정.
    hideLabel: true,
    minChars: 1,
    editable: false,
    emptyText: '선택하세요',
    cellCls: 'fo-table-row-td',
    displayField: 'NM',
    valueField: 'CD',
    autoLoadOnValue: true,
    width: '100%',
    lastQuery: '',
//    proxyParams : {},
    config: {

        nextBindComboExpand: true,
        /***
         * @cfg {string} proxyUrl
         * 데이터를 얻기 위한 서버사이드 주소
         */
        proxyUrl : {},
        /***
         * @cfg {string} defaultParam
         * 콤보가 데이터를 얻기 위한 기본 파라메터이다.
         * 코드성 데이터를 얻기 위해서는 코드집합의 구분자가 필요하다.
         * 기본값은 groupCode이다.
         */
        defaultParam : 'groupCode',
        /***
         * @cfg {boolean} useLocalFilter
         * editable:true해 입력된 값을 서버로 전달하지 않고
         * 로드한 데이터를 활용한 필터를 작동시킨다.
         * true일 경우 queryMode를 'local'로 변경한다.
         */
        useLocalFilter : false,
        proxyParams: null,
        proxyType: 'ajax',
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        /***
         * @cfg {String} valueColumnDataIndex
         * 그리드 내부 에디터로 사용 할 경우로 항상 코드명을 표현하기 위한 용도로
         * 사용되며 이 설정은 에디터를 select한 이후 에디터 내부 코드에 해당하는
         * 값을 그리드 모델에 write해주기 위한 용도다.         *
         */
        valueColumnDataIndex: null,
        /***
         *  @cfg {String Array} relBindVars
         *  콤보가 데이터를 얻기 위해 참조하는 다른 뷰모델 데이터를 정의한다.
         *  일반적으로 콤보는 폼패널 내부의 폼필드 값을 참조하거나 동적으로 변경되는
         *  값을 콤보를 클릭할 때마다 불러와 서버사이드에 전달하도록 하기 위함이다.
         *  이 설정을 이용하면 뷰모델과 상관없이 특정 이름으로 정해진 값을 전달할 수도 있다.
         *  @example
         *
         *  xtype: 'spcombo',
         *  editable: true,
         *  relBindVars: ['CUSTOMER_CODE|CSCODE@2000'],
         *
         *  CUSTOMER_CODE   : 뷰모델 변수명(존재하지 않는 경우는 값이 null로 전달되므로 이 경우는 뷰모델과 상관없이 서버사이드에 원하는 값을 지정해 전달할 목적으로 사용한다.)
         *  |               : 서버사이드에 전송될 이름을 변경할 경우 구분자를 사용해 이후 정의한다.
         *  CSCODE          : 뷰모델 변수명 대신 CSCODE라는 이름으로 보낼수 있다.
         *  @               : 뷰모델 변수의 값을 보내지 않고 원하는 값을 지정할 경우 구분자.
         *  2000            : 뷰모델 변수의 값 대신 전달할 값.
         *
         */
        relBindVars: null
    },

    // clear button add
    triggers: {
        arrow: {
            cls: 'x-form-clear-trigger',
            handler: 'clearValue',
            scope: 'this'
        }
    },

    valueNotFoundText: '검색결과가 존재하지 않습니다.',

    listeners: {
        //render: 'initCombo',
        select: 'onSelect',
        beforequery: 'beforeCheckParamValue'
    },

    initComponent: function () {
        var me = this;
        console.log('initComponent..', me.getId())
        if (me.column && me.valueColumnDataIndex) {
            Ext.apply(me, {
                originalValueField: me.valueField,
                valueField: me.displayField
            });
        }
        me.callParent(arguments);
        me.on('afterrender', function () {
            Ext.each(Ext.Array.clone(Ext.ComponentQuery.query('gridcolumn')), function (field, idx) {
//                if(field.hasOwnProperty('editor')){
//                    console.log(field.getEditor())
//                }
//                        Ext.each(field.editor.nextBindFields, function (bindFieldInfo) {
//                            var fieldArr = bindFieldInfo.split('|'),
//                                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
//
//                            if(fieldParam == combo.name){
//                                debugger;
//                            }
//                        });
//                    }
            });
        })
    },

    /***
     * 재정의 용도로 사용한다.
     * @exmaple
     * this.proxyParams = {
     *      myParam1 : '1',
     *      myParam2 : 'AA'
     * }
     */
    setProxyParams: function () {
        this.proxyParams = {
        }
    },

    clearValue : function () {
        this.callParent(arguments);
        this.getController().clearValue();
    },

    generateUUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    },

    /***
     * value 또는 bind에 의해 값이 설정될 경우만
     * autoLoad: true 하고 나머진 false한다.
     * 값이 설정되지 않은 경우에는 데이터를 미리 가져오지
     * 않도록 한다.
     */
    checkAutoLoad: function () {
        if (this.value) {
            return true;
        }
        if (this.getBind() && this.getBind()['value'] && this.getBind().value.stub.hadValue) {
            return true;
        }
        return false;
    }

});