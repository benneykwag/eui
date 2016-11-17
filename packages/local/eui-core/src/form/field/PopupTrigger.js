/***
 * 팝업을 호출하고 선택된 값을 설정한다.
 *
 */
Ext.define('eui.form.field.PopupTrigger', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.euipopuptrigger',

    /***** Custom Config Start *****/
    config: {
        tempTitle: null,
        title: ''
    },

    cellCls: 'fo-table-row-td',

    displayField: 'ENG_VALUE',
    valueField: 'DT_CODE',
    triggers: {
        search: {
            cls: 'x-form-search-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },


    callBack: 'onTriggerCallback',


    /***
     *
     * @param trigger
     * @param record
     * @param valueField
     * @param displayField
     */
    onTriggerCallback: function (trigger, record, valueField, displayField) {
        debugger;
    },


    onTriggerClick: function () {
        var me = this;
        var options = {
            trigger: this,
            popupConfig: me.popupConfig,
            multiReturnValue: this.multiReturnValue
        };

        Ext.apply(options, this.setSingleRowCondition());

        if(!me.popupConfig.title && me.getTempTitle()){
            me.popupConfig.title =  me.getTempTitle();
        }

        Util.commonPopup(this, me.popupConfig.title,
            me.popupConfig.popupClass,
            me.popupConfig.width,
            me.popupConfig.height,
            options,
            null,
            false).show();

    },

    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            enableKeyEvents: true
        });

        me.callParent(arguments);
        me.addListener('specialkey', this.setSpecialKey, this);
        me.on('blur', me.onBlurHandler,
            this, {
//            delay: 100,
                scope: this
            });
    },

    resetValues: function () {

    },

    /***
     * 검색어를 수정하고 떠나면 리셋한다.
     */
    onBlurHandler: function () {

    },

    /****
     * 트리거에 입력된 값을 params에 포함시킨다.
     * singleRowCheckParamName 는 외부에서 입력할 수 있고 기본값도 가진다.
     * 기본값은
     * params {
     *      SEARCH_VALUE = "입력된값"
     * }
     * @returns {{}}
     */
    setSingleRowCondition: function () {

    },


    /***
     * 엔터키 입력 처리.
     * @param field
     * @param e
     * @param eOpts
     */
    setSpecialKey: function (field, e, eOpts) {
        var me = this;
        if (e.getKey() === Ext.EventObject.ENTER && !Ext.isEmpty(this.getValue())) {
            if (!this.checkSingleResult(field)) {
                field.onTriggerClick();
            }
        }
    }
});