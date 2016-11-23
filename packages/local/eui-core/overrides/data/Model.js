Ext.define('Override.data.Model', {
    override: 'Ext.data.Model',

    /***
     * 모델 validation 처리 후 메시지 호출.
     * @returns {boolean}
     */
    recordValidationCheck: function () {
        if (!this.isValid()) {
            var validation = this.getValidation(),
                modified = validation.modified;
            for (var test in modified) {
                var value = modified[test];
                if (value) {
                    if (!Ext.isBoolean(validation.get(test))) {
                        Ext.Msg.alert('확인', validation.get(test));
                    }
                }
            }
            return false;
        }
        return true;
    },

    /***
     * 모델 데이터를 출력한다.
     * checkboxgroup의 오브젝트 키값이 중복 처리되는 것을
     * 막기 위한 코드로 출발함.
     * @param options
     * @returns {{}}
     */
    getData: function (options) {
        var me = this,
            ret = {},
            opts = (options === true) ? me._getAssociatedOptions : (options || ret), //cheat
            data = me.data,
            associated = opts.associated,
            changes = opts.changes,
            critical = changes && opts.critical,
            content = changes ? me.modified : data,
            fieldsMap = me.fieldsMap,
            persist = opts.persist,
            serialize = opts.serialize,
            criticalFields, field, n, name, value;

        // DON'T use "opts" from here on...

        // Keep in mind the two legacy use cases:
        //  - getData() ==> Ext.apply({}, me.data)
        //  - getData(true) ==> Ext.apply(Ext.apply({}, me.data), me.getAssociatedData())

        if (content) { // when processing only changes, me.modified could be null
            for (name in content) {
                value = data[name];
                field = fieldsMap[name];
                if (field) {
                    if (persist && !field.persist) {
                        continue;
                    }
                    if (serialize && field.serialize) {
                        value = field.serialize(value, me);
                    }
                    // 서버로 전송되는 날자의 포맷지정.(model field 설정될 경우.
                    if(field.type === 'date'){
                        if(field.dateFormat){
                            value = Ext.Date.format(value, field.dateFormat);
                        }else{
                            value = Ext.Date.format(value, eui.Config.modelGetDataDateFormat);
                        }

                    }
                }else if(Ext.isDate(value)){ // 모델 필드 설정안한 날자는
                    value = Ext.Date.format(value, eui.Config.modelGetDataDateFormat);
                }
                // 기존 코드 ret[name] = value; 를 아래로 대체함.
                // checkboxgroup 그룹 사용시 아래와 같이 obj가 중복 표현되는 것을 막기 위함..
                // case 1
                // job {
                //    job : ['A01','A02']
                // }
                // case 2 (name을 사용하지 않을 경우 처리)
                // name: 'job',
                // defaults: {
                //        name: 'job'
                //    },
                var autogenkey ='';
                if(value instanceof Object){
                    for(var test in value){
                        autogenkey = test;
                    }
                }


                if (value && !Ext.isEmpty(value[name])) {   // case1
                    ret[name] = value[name];
                }else if(autogenkey.indexOf('euicheckboxgroup') != -1) { // case2
                    ret[name] = value[autogenkey];
                } else {
                    ret[name] = value;
                }
            }
        }

        if (critical) {
            criticalFields = me.self.criticalFields || me.getCriticalFields();
            for (n = criticalFields.length; n-- > 0;) {
                name = (field = criticalFields[n]).name;

                if (!(name in ret)) {
                    value = data[name];
                    if (serialize && field.serialize) {
                        value = field.serialize(value, me);
                    }
                    ret[name] = value;
                }
            }
        }

        if (associated) {
            me.getAssociatedData(ret, opts); // pass ret so new data is added to our object
        }
        // 기본 신규 레코드로 처리.
        if(Ext.isEmpty(ret['__rowStatus'])){
            ret['__rowStatus'] = 'I';
        }
        return ret;
    }
});