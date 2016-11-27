describe('Ext.chart.axis.Time', function () {
    
    describe('renderer', function () {
        var chart;
        
        afterEach(function() {
            Ext.destroy(chart);
        });

        it('should work with custom renderers even when "dateFormat" is set', function () {
            var axisRendererCallCount = 0,
                lastAxisRendererResult,
                axes,
                timeAxis,
                performLayoutSpy,
                axisLayoutSpy;

            chart = new Ext.chart.CartesianChart({
                renderTo: Ext.getBody(),
                width: 400,
                height: 400,
                insetPadding: 60,
                store: new Ext.data.Store({
                    data: [
                        {value: 1, time: new Date('Jun 01 2015 12:00')},
                        {value: 3, time: new Date('Jun 01 2015 13:00')},
                        {value: 2, time: new Date('Jun 01 2015 14:00')}
                    ]
                }),
                series: {
                    type: 'line',
                    xField: 'time',
                    yField: 'value'
                },
                axes: [
                    {
                        type: 'numeric',
                        position: 'left'
                    },
                    {
                        type: 'time',
                        position: 'bottom',
                        dateFormat: 'F j g:i A',
                        renderer: function () {
                            axisRendererCallCount++;
                            return lastAxisRendererResult = 'hello';
                        }
                    }
                ]
            });
            chart.performLayout();
            expect(axisRendererCallCount).toBeGreaterThan(3);

            axes = chart.getAxes();
            timeAxis = axes[1];
            performLayoutSpy = spyOn(chart, 'performLayout').andCallThrough();

            axisRendererCallCount = 0;
            runs(function () {
                timeAxis.getSegmenter().setStep({
                    unit: Ext.Date.HOUR,
                    step: 1
                });
            });

            waitsForSpy(performLayoutSpy, 'layout after setStep');

            runs(function () {
                expect(axisRendererCallCount).toBe(3);
                expect(lastAxisRendererResult).toBe('hello');

                performLayoutSpy.reset();
                axisRendererCallCount = 0;
                lastAxisRendererResult = undefined;
                timeAxis.setRenderer(function () {
                    axisRendererCallCount++;
                    return lastAxisRendererResult = 'hi';
                });
                // New custom renderer should trigger axis and chart layouts.
            });

            waitsForSpy(performLayoutSpy, 'layout after setRenderer');

            runs(function () {
                expect(axisRendererCallCount).toBe(3);
                expect(lastAxisRendererResult).toBe('hi');

                performLayoutSpy.reset();
                timeAxis.setRenderer(null);
                // No user renderer, but dateFormat is set, should create a default renderer
                // based on dateFormat.
                var defaultRenderer = timeAxis.getRenderer();
                expect(defaultRenderer.isDefault).toBe(true);
            });

            waitsForSpy(performLayoutSpy, 'layout after reset renderer');
        });
    });
    
});