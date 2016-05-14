Ext.define('eui.form.field.Number', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.spnumber',

    cellCls: 'fo-table-row-td',
    hideTrigger: true,
    mouseWheelEnabled: false,
    fieldStyle: 'text-align: right',
    decimalPrecision: 0,
    useThousandSeparator: true,
    submitLocaleSeparator: false,
    value: 0,
    width: '100%',
//    fieldStyle: 'text-align: right;ime-mode:disabled',
    initComponent: function () {
        var me = this;
        me.enableKeyEvents = true;
        me.callParent(arguments);
        me.setInterceptor(me);
        me.addListener('focus', function () {
            if (this.readOnly || this.disabled) return;

            this.setRawValue(this.value);

            if (!Ext.isWebKit) {
                if (!!me.selectOnFocus) {
                    this.selectText();
                }
            }
        });
    },
    setInterceptor: function (me) {
        Ext.Function.interceptAfter(me, "postBlur", function (e) {
            var me = this,
                hadError = me.hasActiveError();

            delete me.needsValidateOnEnable;
            me.unsetActiveError();
            if (hadError) {
                me.setError('');
                me.setValue('');
            }
        });
    },
    /**
     * @inheritdoc
     */
    toRawNumber: function (value) {
        return String(value).replace(this.decimalSeparator, '.').replace(new RegExp(Ext.util.Format.thousandSeparator, "g"), '');
    },

    /**
     * @inheritdoc
     */
    getErrors: function (value) {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        var me = this,
            errors = [],
            format = Ext.String.format,
            onlynumber = "",
            num;

        value = Ext.isDefined(value) ? value : this.processRawValue(this.getRawValue());

        if (value.length < 1) {
            return errors;
        }

        value = me.toRawNumber(value);

        onlynumber = value.replace(this.decimalSeparator, '');
        errors = Ext.form.field.Text.prototype.getErrors.apply(me, [onlynumber]);

        if (isNaN(value.replace(Ext.util.Format.thousandSeparator, ''))) {
            errors.push(format(me.nanText, value));
        }

        num = me.parseValue(value);

        if (me.minValue === 0 && num < 0) {
            errors.push(this.negativeText);
        }
        else if (num < me.minValue) {
            errors.push(format(me.minText, me.minValue));
        }

        if (num > me.maxValue) {
            errors.push(format(me.maxText, me.maxValue));
        }

        return errors;
    },



    /**
     * @inheritdoc
     */
    getSubmitValue: function () {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        var me = this,
            value = me.callParent();

        if (!me.submitLocaleSeparator) {
            value = me.toRawNumber(value);
        }
        return value;
    },

    /**
     * @inheritdoc
     */
    setMinValue: function (value) {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        var me = this,
            allowed;

        me.minValue = Ext.Number.from(value, Number.NEGATIVE_INFINITY);
        me.toggleSpinners();

        if (me.disableKeyFilter !== true) {
            allowed = me.baseChars + '';

            if (me.allowExponential) {
                allowed += me.decimalSeparator + 'e+-';
            }
            else {
                allowed += Ext.util.Format.thousandSeparator;
                if (me.allowDecimals) {
                    allowed += me.decimalSeparator;
                }
                if (me.minValue < 0) {
                    allowed += '-';
                }
            }

            allowed = Ext.String.escapeRegex(allowed);
            me.maskRe = new RegExp('[' + allowed + ']');
            if (me.autoStripChars) {
                me.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
            }
        }
    },
    /**
     * @private
     */
    parseValue: function (value) {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        value = parseFloat(this.toRawNumber(value));
        return isNaN(value) ? null : value;
    },
    exNumber: function (v, formatString) {
        var UtilFormat = Ext.util.Format,
            stripTagsRE = /<\/?[^>]+>/gi,
            stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
            nl2brRe = /\r?\n/g,

        // A RegExp to remove from a number format string, all characters except digits and '.'
            formatCleanRe = /[^\d\.]/g,

        // A RegExp to remove from a number format string, all characters except digits and the local decimal separator.
        // Created on first use. The local decimal separator character must be initialized for this to be created.
            I18NFormatCleanRe;
        if (!formatString) {
            return v;
        }
        v = Ext.Number.from(v, NaN);
        if (isNaN(v)) {
            return '';
        }
        var comma = UtilFormat.thousandSeparator,
            dec = UtilFormat.decimalSeparator,
            neg = v < 0,
            hasComma,
            psplit,
            fnum,
            cnum,
            parr,
            j,
            m,
            n,
            i;

        v = Math.abs(v);

        // The "/i" suffix allows caller to use a locale-specific formatting string.
        // Clean the format string by removing all but numerals and the decimal separator.
        // Then split the format string into pre and post decimal segments according to *what* the
        // decimal separator is. If they are specifying "/i", they are using the local convention in the format string.
        if (formatString.substr(formatString.length - 2) == '/i') {
            if (!I18NFormatCleanRe) {
                I18NFormatCleanRe = new RegExp('[^\\d\\' + UtilFormat.decimalSeparator + ']', 'g');
            }
            formatString = formatString.substr(0, formatString.length - 2);
            hasComma = formatString.indexOf(comma) != -1;
            psplit = formatString.replace(I18NFormatCleanRe, '').split(dec);
        } else {
            hasComma = formatString.indexOf(',') != -1;
            psplit = formatString.replace(formatCleanRe, '').split('.');
        }

        if (psplit.length > 2) {
            //<debug>
            Ext.Error.raise({
                sourceClass: "Ext.util.Format",
                sourceMethod: "number",
                value: v,
                formatString: formatString,
                msg: "Invalid number format, should have no more than 1 decimal"
            });
            //</debug>
        } else if (psplit.length > 1) {
            v = Ext.Number.toFixed(v, psplit[1].length);
        } else {
            v = Ext.Number.toFixed(v, 0);
        }

        fnum = v.toString();

        psplit = fnum.split('.');

        if (hasComma) {
            cnum = psplit[0];
            parr = [];
            j = cnum.length;
            m = Math.floor(j / 3);
            n = cnum.length % 3 || 3;

            for (i = 0; i < j; i += n) {
                if (i !== 0) {
                    n = 3;
                }

                parr[parr.length] = cnum.substr(i, n);
                m -= 1;
            }
            fnum = parr.join(comma);
            if (psplit[1]) {
                fnum += dec + psplit[1];
            }
        } else {
            if (psplit[1]) {
                fnum = psplit[0] + dec + psplit[1];
            }
        }

        if (neg) {
            /*
             * Edge case. If we have a very small negative number it will get rounded to 0,
             * however the initial check at the top will still report as negative. Replace
             * everything but 1-9 and check if the string is empty to determine a 0 value.
             */
            neg = fnum.replace(/[^1-9]/g, '') !== '';
        }

        return (neg ? '-' : '') + formatString.replace(/[\d,?\.?]+/, fnum);
    },
    valueToRaw: function (value) {
        if (!this.useThousandSeparator)
            return this.callParent(arguments);
        var me = this;

        var format = "000,000";

        for (var i = 0; i < me.decimalPrecision; i++) {
            if (i == 0) {
                format += ".";
            }
            format += "0";
        }
//        if (value !== undefined && Ext.Number.toFixed(value, 0) == value) {
//            console.log(Ext.Number.toFixed(value, 0),  value)
//            format = "000,000";
//        }
        value = me.parseValue(me.exNumber(value, format));
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(me.toRawNumber(value));
        value = isNaN(value) ? '' : String(me.exNumber(value, format)).replace('.', me.decimalSeparator);
        return value;
    }
});