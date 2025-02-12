import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Col } from 'reactstrap';
import { SalesForecastCharts } from './DashboardAnalyticsCharts';
import axiosWithToken from '../../pages/ApiCalls/axiosWithToken';

const SalesForecast = () => {

    const [chartData, setChartData] = useState([
        { name: 'PENDING_SALES', data: [0] },
        { name: 'COMPLETED_SALES', data: [0] },
        { name: 'CANCELLED_SALES', data: [0] }
    ]);

    const [sales, setSales] = useState([]);

    const getSalesData = async () => {
        try {
            const response = await axiosWithToken.get("/admin/orders");
            console.log('API Response:', response); // Log the entire response
            console.log('Response Data:', response.data); // Log the response data structure

            const data = response.data;

            if (data && Array.isArray(data)) {
                const pendingSales = data.filter(item => item.status === 'PENDING');
                const completedSales = data.filter(item => item.status === 'COMPLETED');
                const cancelledSales = data.filter(item => item.status === 'CANCELLED');

                const salesData = [
                    {
                        name: 'PENDING_SALES',
                        data: [pendingSales.length]
                    },
                    {
                        name: 'COMPLETED_SALES',
                        data: [completedSales.length]
                    },
                    {
                        name: 'CANCELLED_SALES',
                        data: [cancelledSales.length]
                    }
                ];

                setSales(data);
                setChartData(salesData);
            } else {
                console.warn("No sales data found or data is not in the expected format.");
                setSales([]);
                setChartData([]);
            }
        } catch (error) {
            console.error("Error getting sales data:", error);
            setSales([]);
            setChartData([]);
        }
    };

    useEffect(() => {
        getSalesData();
    }, []);

    return (
        <React.Fragment>
            <Col xxl={3} md={6}>
                <Card>
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Orders chart</h4>
                    </CardHeader>
                    <div className="card-body pb-0">
                        <div id="sales-forecast-chart" className="apex-charts" dir="ltr" style={{ height: '400px' }}>
                            <SalesForecastCharts
                                series={chartData || []}
                                dataColors='["--vz-primary", "--vz-secondary", "--vz-info"]'
                            />
                        </div>
                    </div>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default SalesForecast;
