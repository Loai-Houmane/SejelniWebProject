import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { Card, CardHeader, Col, DropdownMenu, DropdownToggle, Dropdown, DropdownItem, CardBody } from 'reactstrap';
import { useSelector, useDispatch } from "react-redux";
import axiosWithToken from '../../pages/ApiCalls/axiosWithToken';
//Import Icons
import FeatherIcon from "feather-icons-react";

import { UsersByDeviceCharts } from './DashboardAnalyticsCharts';
import { createSelector } from 'reselect';

const UsersByDevice = () => {
    const [isUserDropdown, setUserDropdown] = useState(false);
    const toggleDropdown = () => setUserDropdown(!isUserDropdown);

    const dispatch = useDispatch();

    const [chartData, setchartData] = useState([]);
    const [users, setUsers] = useState([]);

    const userdeviceData = createSelector(
        (state) => state.DashboardAnalytics,
        (userDeviceData) => userDeviceData.userDeviceData
    );
    // Inside your component
    const userDeviceData = useSelector(userdeviceData);

    useEffect(() => {
        setchartData(userDeviceData);
    }, [userDeviceData]);

    const [seletedMonth, setSeletedMonth] = useState("today");
    const onChangeChartPeriod = pType => {
        setSeletedMonth(pType);
        getAllAgencies();
    };

    useEffect(() => {
        getAllAgencies();
    }, []);

    const AgencyStatus = {
        PENDING: 'PENDING',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        SUSPENDED: 'SUSPENDED'
    };

    const getAllAgencies = async () => {
        try {
            const response = await axiosWithToken.get("/admin/agencies");
            console.log('API Response:', response); // Log the entire response
            console.log('Response Data:', response.data); // Log the response data structure

            // Adjust the condition based on the actual structure of response.data
            if (Array.isArray(response.data) && response.data.length > 0) {
                const agencies = response.data.map((agency) => ({
                    label: agency.name, // Updated to match the 'name' field
                    value: agency.id,
                    status: agency.status // Assuming the agency object has a status property
                }));
                setUsers(agencies);

                const totalAgencies = agencies.length;
                const pendingAgencies = agencies.filter(agency => agency.status === AgencyStatus.PENDING).length;
                const approvedAgencies = agencies.filter(agency => agency.status === AgencyStatus.APPROVED).length;
                const rejectedAgencies = agencies.filter(agency => agency.status === AgencyStatus.REJECTED).length;
                const suspendedAgencies = agencies.filter(agency => agency.status === AgencyStatus.SUSPENDED).length;

                const pendingPercentage = (pendingAgencies / totalAgencies) * 100;
                const approvedPercentage = (approvedAgencies / totalAgencies) * 100;
                const rejectedPercentage = (rejectedAgencies / totalAgencies) * 100;
                const suspendedPercentage = (suspendedAgencies / totalAgencies) * 100;

                setchartData([
                    { type: 'PENDING', count: pendingAgencies, percentage: pendingPercentage },
                    { type: 'APPROVED', count: approvedAgencies, percentage: approvedPercentage },
                    { type: 'REJECTED', count: rejectedAgencies, percentage: rejectedPercentage },
                    { type: 'SUSPENDED', count: suspendedAgencies, percentage: suspendedPercentage }
                ]);

                console.log('Total Agencies:', totalAgencies);
                console.log('Pending Agencies:', pendingAgencies);
                console.log('Approved Agencies:', approvedAgencies);
                console.log('Rejected Agencies:', rejectedAgencies);
                console.log('Suspended Agencies:', suspendedAgencies);
            } else {
                console.log("No Agency found");
                setUsers([]);
                setchartData([]);
            }
        } catch (error) {
            console.error("Error getting agencies:", error);
            throw error;
        }
    };

    useEffect(() => {
        getAllAgencies();
    }, []);

    return (
        <React.Fragment>
            <Col xxl={3} md={6}>
                <Card className="card-height-100">
                    <CardHeader className="align-items-center d-flex">
                        <h4 className="card-title mb-0 flex-grow-1">Agencies chart</h4>
                        <div className="flex-shrink-0">
                            {/* <Dropdown className="card-header-dropdown" isOpen={isUserDropdown} toggle={toggleDropdown} direction="start">
                                <DropdownToggle tag="a" className="text-reset dropdown-btn" role="button">
                                    <span className="text-muted fs-16"><i className="mdi mdi-dots-vertical align-middle"></i></span>
                                </DropdownToggle>
                                <DropdownMenu className="dropdown-menu-end" >
                                    <DropdownItem onClick={() => { onChangeChartPeriod("today"); }} className={seletedMonth === "today" ? "active" : ""}>Today</DropdownItem>
                                    <DropdownItem onClick={() => { onChangeChartPeriod("lastWeek"); }} className={seletedMonth === "lastWeek" ? "active" : ""}>Last Week</DropdownItem>
                                    <DropdownItem onClick={() => { onChangeChartPeriod("lastMonth"); }} className={seletedMonth === "lastMonth" ? "active" : ""}>Last Month</DropdownItem>
                                    <DropdownItem onClick={() => { onChangeChartPeriod("currentYear"); }} className={seletedMonth === "currentYear" ? "active" : ""}>Current Year</DropdownItem>
                                </DropdownMenu>
                            </Dropdown> */}
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div dir="ltr">
                            <UsersByDeviceCharts series={chartData.map(data => data.count)} dataColors='["--vz-primary", "--vz-warning", "--vz-info", "--vz-danger"]' />
                        </div>

                        <div className="table-responsive mt-3">
                            <table className="table table-borderless table-sm table-centered align-middle table-nowrap mb-0">
                                <tbody className="border-0">
                                    {chartData.map((data, index) => (
                                        <tr key={index}>
                                            <td><h4 className="text-truncate fs-14 mb-0"><i className={`ri-stop-fill align-middle fs-18 text-${data.type.toLowerCase()} me-2`}></i>{data.type} </h4></td>
                                            <td><p className="text-muted mb-0">
                                                <FontAwesomeIcon
                                                    icon={faBuilding}
                                                    className="me-2"
                                                    style={{ fontSize: '20px', color: '#ccc' }} // Changed color to a bit gray
                                                />
                                                {data.count}</p></td>
                                            <td className="text-end"><p className={`text-${data.percentage >= 0 ? 'success' : 'danger'} fw-medium fs-12 mb-0`}><i className={`ri-arrow-${data.percentage >= 0 ? 'up' : 'down'}-s-fill fs-5 align-middle`}></i>{data.percentage.toFixed(2)}%</p></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    );
};

export default UsersByDevice;