/***
 *
 * ## Summary
 *
 * code & code name을 같이 사용하는 팝업 전용 fieldcontainer
 *
 * # Sample
 *
 *     @example
 *
 *     Ext.define('BizField', {
 *          extend: 'eui.form.PopUpFieldContainer',
 *          alias: 'widget.bizfield',
 *          //requires: ['Eui.sample.view.common.PopUp03'],   // 공용 팝업을 사용하지 않고 따로 정의 할 경우
 *          fieldLabel: '사업자',
 *          defaultListenerScope: true,
 *          allowBlank: false,
 *          // 검색 파라메터
 *          searchKeyField : 'SEARCHKEY',
 *          // 다중 선택 가능.
 *          multiSelect: false,
 *         // 검색창 내부 서버사이드 주소.
 *         proxyUrl : 'eui-core/resources/data/data04.json',
 *
 *         // 팝업 너비
 *         popupWidth: 500,
 *         // 팝업 높이
 *         popupHeight: 250,
 *
 *         // 별도 팝업 정의 시 클래스 위젯명(정의하지 않으면 기본 팝업)
 *         //    popupWidget: 'popup03',
 *         simpleColumns: [
 *             {
 *                 text: 'CUSTOMER_NAME',
 *                 dataIndex: 'CUSTOMER_NAME'
 *             }
 *         ],
 *         normalColumns: [
 *             {
 *                 text: 'CUSTOMER_CODE',
 *                 dataIndex: 'CUSTOMER_CODE'
 *             },
 *             {
 *                 text: 'CUSTOMER_NAME',
 *                 dataIndex: 'CUSTOMER_NAME'
 *             },
 *             {
 *                 text: 'ADDR_ENG',
 *                 dataIndex: 'ADDR_ENG'
 *             }
 *         ],
 *
 *         formConfig: {
 *             xtype: 'euiform',
 *             title: '사업자 검색1',
 *             tableColumns: 1,
 *             items: [
 *                 {
 *                     xtype: 'euitext',
 *                     name: 'SEARCHKEY',
 *                     fieldLabel: '사업자코드'
 *                 },
 *             {
 *                 xtype: 'euitext',
 *                 name: 'SEARCHKEYNAME',
 *                 fieldLabel: '사업자명'
 *             }
 *         ]
 *     },
 *
 *     setPopupValues: function (trigger, record, valueField, displayField) {
 *         var me = this,
 *         firstField = this.down('#firstField'),
 *         secondField = this.down('#secondField');
 *
 *         if(Ext.isArray(record)) {
 *         // 복수 선택 처리.
 *         }else{
 *             firstField.setValue(record.get('CUSTOMER_CODE'));
 *             firstField.resetOriginalValue();
 *             secondField.setValue(record.get('CUSTOMER_NAME'));
 *             secondField.resetOriginalValue();
 *         }
 *     }
 *      });
 *
 *      Ext.define('CheckboxGroup', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          requires: ['BizField'],
 *          viewModel: {
 *
 *          },
 *          title: '체크박스그룹',
 *          items: [
 *             {
 *               xtype: 'bizfield',
 *               fieldLabel: '체크박스그룹',
 *             }
 *          ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  CHECKBOXGROUP : ['KOREA','JAPAN','USA']
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          },
 *
 *          checkBoxgroupAllCheck: function(button){
 *              this.down('#euicheckboxgroup').setValue(['KOREA','JAPAN','USA','RUSIA']);
 *          },
 *
 *          checkBoxgroupAllUnCheck: function(button){
 *              this.down('#euicheckboxgroup').setValue();
 *          }
 *      });
 *
 *      Ext.create('CheckboxGroup',{
 *          width: 400,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.PopUpFieldContainer', {
    extend: 'eui.form.FieldContainer',
    alias: 'widget.euipopupfieldcontainer',

    bindVar: {
        FIELD1: null,
        FIELD2: null
    },

    firstReadOnly : false,
    secondReadOnly: false,

    /***
     * 팝업 내부에서 값을 결정하면 이 메소드를 구현해야한다.
     */
    setPopupValues : Ext.emptyFn,

    listeners: {
        specialkey: 'setSpecialKey',
        blur: 'onBlur'
    },

    /***
     * Enter, Tab 에 대한 반응 처리.
     * @param field
     * @param e
     * @param eOpts
     */
    setSpecialKey: function (field, e, eOpts) {
        var me = this,
            firstField = this.down('#firstField'),
            secondField = this.down('#secondField');
//        if ((e.getKey() === Ext.EventObject.ENTER
//            && !Ext.isEmpty(field.getValue()))
//            || (e.getKey() === Ext.EventObject.TAB && !Ext.isEmpty(field.getValue()))) {
//            if (!me.checkSingleResult(field)) {
//                secondField.expand(field.simpleMode);
//            }
//        }
        if (e.getKey() === Ext.EventObject.ENTER
//            && !Ext.isEmpty(field.getValue())
            ) {
            if (!me.checkSingleResult(field)) {
                // senchaField가 expand시 blur발생 방지 ..
                firstField.suspendEvent('blur');

                if (field.simpleMode) { // 그리드에 선택된 로우를 세팅
                    // collapse 되어 있는 경우 하지 않고 열기만 한다.
                    if(secondField.isExpanded){
                        // 값이 변경되었을 경우.
                        if(secondField.getValue() != secondField._tmpValue){
                            //
                            secondField.fireEvent('load',{ params : { key: secondField.getValue() }})
                            secondField._tmpValue = secondField.getValue();
                            secondField.picker.down('grid').store.getProxy().extraParams[me.searchKeyField] = secondField.getValue();
                            secondField.picker.down('grid').store.load({
                                /*params : {
                                    SEARCH_KEYWORD : secondField.getValue(),
                                    groupCode: "SP9997",
                                    SQL: {
                                        "HQCODE": "",
                                        "HQNAME": secondField.getValue(),
                                        "HQLOCNAME": ""
                                    }
                                }*/
                            })
                        }else{
                            secondField.picker.items.items[0].fireEvent('enterdblclick');
                        }
                    }else{
                        secondField._tmpValue = secondField.getValue();
                        secondField.expand(field.simpleMode);
                    }

                } else {  // 상세 검색
                    secondField.expand(field.simpleMode);
                }

                secondField.picker.on('hide', function () {
                    firstField.resumeEvent('blur');
                })
            }
        }

        // 화살표 상하 키.
        // 우측 simpleMode use
        if (e.getKey() == 40 || e.getKey() == 38) {
            console.log('key... ', e.getKey());
            if (secondField.picker) {
                secondField.expand(field.simpleMode);
                secondField.picker.items.items[0].fireEvent('keydown', e.getKey());

            }
        }
    },

    /***
     * 수정하다 포커스 밖으로 나갈 경우 리셋한다.
     * @param field
     */
    checkBlur: function (field) {
        var firstField = this.down('#firstField'),
            secondField = this.down('#secondField');
        if (field.isFormField) {
            if (field.originalValue != field.getValue()) {
                firstField.setValue('');
                secondField.setValue('');
            }
        }
    },

    /***
     * Enter & Tab 시 한건 이면 false, 두건 이상이면  true 리턴.
     *
     * @param field
     * @returns {boolean}
     */
    checkSingleResult: function (field) {
        var me = this;
        // 좌측 만 적용.
        if(field.simpleMode){
            return false;
        }
        if(Ext.isEmpty(field.getValue())){
            return false;
        }
        var params = {},
            retValue = false;

        params['page'] = 1;
        params['start'] = 0;
        params['limit'] = 2;
        params[me.searchKeyField] = field.getValue();

        Util.CommonAjax({
            method: 'POST',
            url: me.popupConfig.proxyUrl,
            params: params,
            pSync: false,
            pCallback: function (v, params, result) {
                if (result.success && result.total == 1) {
                    retValue = true;
                    me.setPopupValues(field, Ext.create('Ext.data.Model', result.data[0]));
                    me.setOriginValues();
                }
            }
        });

        return retValue;
    },

    setOriginValues: function () {
        var firstField = this.down('#firstField'),
            secondField = this.down('#secondField');
        firstField.resetOriginalValue();
        secondField.resetOriginalValue();
    },

    /***
     * popupConfig를 전달하고 기존코드를 수용하기 위한
     * 메소드이다.
     * 기존 코드는 아래와 같으며 향후 사용하지 않는다.
     * popupConfig: {
     *  popupWidget: 'popup03',
     *  title: '사업자 검색',
     *  width: 500,
     *  height: 250
    },
     */
    setPopupConfig: function () {
        var me = this;
        if(!me.popupConfig){
            me.popupConfig = {};
        }
        Ext.applyIf(me.popupConfig,{
            searchKeyField : me.searchKeyField,
            multiSelect: me.multiSelect,
            proxyUrl : me.proxyUrl,
            simpleColumns: me.simpleColumns,
            normalColumns: me.normalColumns,
            formConfig: me.formConfig,
            width: me.popupWidth,
            height: me.popupHeight
        });
    },

    initComponent: function () {
        var me = this;

       me.setPopupConfig();

        Ext.apply(this, {
            items: [
                {
                    bind: me.bindVar.FIELD1,
                    hideLabel: true,
                    itemId: 'firstField',
                    readOnly: me.firstReadOnly,
                    xtype: 'euitext',
//                    triggerCls: 'x-form-search-trigger',
//                    triggers: {
//                        search: {
//                            cls: 'x-form-search-trigger',
//                            handler: 'onTriggerClick',
//                            scope: 'this'
//                        }
//                    },
                    simpleMode: false,
                    listeners: {
                        blur: 'checkBlur',
                        afterrender: {
                            delay: 1000,
                            fn: function (cmp) {
                                cmp.resetOriginalValue();
                            }
                        },
                        render: function () {
                            me.relayEvents(this, [
                                'specialkey'
                            ]);
                        }
                    }
                },
                {
                    xtype: 'euipopuppicker',
                    hideLabel: true,
                    simpleMode: true,
                    readOnly: me.secondReadOnly,
                    triggerCls: 'x-form-arrow-trigger',
                    itemId: 'secondField',
                    bind: me.bindVar.FIELD2,
                    valueField: 'CUSTOMER_NAME',
//                    searchKeyField : me.searchKeyField,
                    expand: me.expand,
                    doAlign: me.doAlign,


                    listeners: {
                        blur: function () {
                          me.checkBlur(this);
                        },
                        render: function () {
                            me.relayEvents(this, [
                                'blur', 'specialkey'
                            ]);
                        },
                        popupsetvalues: 'setPopupValues'
                    },
//                    simpleColumns: me.simpleColumns,
//                    normalColumns: me.normalColumns,
//                    formConfig: me.formConfig,
                    popupConfig: me.popupConfig
//                    multiSelect: me.multiSelect
                }
            ]
        });
        this.callParent(arguments);
    },

    doAlign: function () {
        var me = this,
            picker = me.picker,
            aboveSfx = '-above',
            newPos,
            isAbove;


        if (me.picker.simpleMode) {
            // Align to the trigger wrap because the border isn't always on the input element, which
            // can cause the offset to be off
            picker.el.alignTo(me.triggerWrap, me.pickerAlign, me.pickerOffset);
        } else {
            picker.el.alignTo(me.triggerWrap, me.pickerAlign, [-120, 0]);
        }
        // We used *element* alignTo to bypass the automatic reposition on scroll which
        // Floating#alignTo does. So we must sync the Component state.
        newPos = picker.floatParent ? picker.getOffsetsTo(picker.floatParent.getTargetEl()) : picker.getXY();
        picker.x = newPos[0];
        picker.y = newPos[1];

        // add the {openCls}-above class if the picker was aligned above
        // the field due to hitting the bottom of the viewport
        isAbove = picker.el.getY() < me.inputEl.getY();
        me.bodyEl[isAbove ? 'addCls' : 'removeCls'](me.openCls + aboveSfx);
        picker[isAbove ? 'addCls' : 'removeCls'](picker.baseCls + aboveSfx);
    },


    expand: function (simpleMode) {
        var me = this,
            bodyEl, picker, doc;

        if (me.rendered && !me.isExpanded && !me.destroyed) {
            bodyEl = me.bodyEl;
            picker = me.getPicker();
            doc = Ext.getDoc();
            picker.setMaxHeight(picker.initialConfig.maxHeight);

            picker.simpleMode = (Ext.isEmpty(simpleMode) ? me.simpleMode : simpleMode);

            if (picker.simpleMode) {
                me.matchFieldWidth = true;
                picker.setWidth(me.bodyEl.getWidth());
                picker.setHeight(100)
            } else {
                me.matchFieldWidth = false;

                picker.setWidth(me.popupConfig.width);
                picker.setHeight(me.popupConfig.height)
            }

            // Show the picker and set isExpanded flag. alignPicker only works if isExpanded.
            picker.show();

            if (picker.simpleMode) {
                picker.down('header').hide();
            } else {
                picker.down('header').show();
            }


            me.isExpanded = true;
            me.alignPicker();
            bodyEl.addCls(me.openCls);

            if (!me.ariaStaticRoles[me.ariaRole]) {
                if (!me.ariaEl.dom.hasAttribute('aria-owns')) {
                    me.ariaEl.dom.setAttribute('aria-owns', picker.listEl ? picker.listEl.id : picker.el.id);
                }

                me.ariaEl.dom.setAttribute('aria-expanded', true);
            }

            // Collapse on touch outside this component tree.
            // Because touch platforms do not focus document.body on touch
            // so no focusleave would occur to trigger a collapse.
            me.touchListeners = doc.on({
                // Do not translate on non-touch platforms.
                // mousedown will blur the field.
                translate: false,
                touchstart: me.collapseIf,
                scope: me,
                delegated: false,
                destroyable: true
            });

            // Scrolling of anything which causes this field to move should collapse
            me.scrollListeners = Ext.on({
                scroll: me.onGlobalScroll,
                scope: me,
                destroyable: true
            });

            // Buffer is used to allow any layouts to complete before we align
            Ext.on('resize', me.alignPicker, me, {buffer: 1});
            me.fireEvent('expand', me);
            me.onExpand();
        }
    }
});