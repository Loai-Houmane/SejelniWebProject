import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import axiosWithToken from '../../../ApiCalls/axiosWithToken';
import Cookies from "js-cookie";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import "./Collaborators.css"

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [students, setStudents] = useState({});
    const token = Cookies.get("accessToken");

    const fetchLeads = async () => {
        try {
            const response = await axiosWithToken.get('/agencies/lead/All');
            setLeads(response.data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    };

    const fetchStudent = async (id) => {
        try {
            const response = await axiosWithToken.get(`/student/student/${id}`);
            setStudents(prev => ({ ...prev, [id]: response.data }));
        } catch (error) {
            console.error("Error fetching student data:", error);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    useEffect(() => {
        leads.forEach(lead => {
            if (!students[lead.studentId]) {
                fetchStudent(lead.studentId);
            }
        });
    }, [leads]);

    const getBadgeClass = (status) => {
        switch (status) {
            case 'NEW':
                return 'bg-danger-subtle text-danger';
            case 'IN_PROGRESS':
                return 'bg-warning-subtle text-dark'; // Updated to text-dark for better contrast on light theme
            case 'CONVERTED':
                return 'bg-success-subtle text-success';
            default:
                return '';
        }
    };

    const leadsData = leads.reduce((acc, lead) => {
        acc.thisMonthLeads += 1;
        if (lead.status === 'CONVERTED') {
            acc.conversionRate += 1;
        }
        return acc;
    }, { thisMonthLeads: 0, conversionRate: 0 });

    leadsData.conversionRate = leadsData.thisMonthLeads ? (leadsData.conversionRate / leadsData.thisMonthLeads * 100).toFixed(2) : 0;

    const leadsPercentageChange = leadsData.lastMonthLeads
        ? ((leadsData.thisMonthLeads - leadsData.lastMonthLeads) / leadsData.lastMonthLeads * 100).toFixed(2)
        : 0;

    return (
        <React.Fragment>
            <Row>
                <Col md={6}>
                    <Card className="card-animate same-height padded-card">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-semibold text-muted mb-0">Leads Received</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={leadsData.thisMonthLeads}
                                                duration={4}
                                            />
                                        </span></h2>
                                    <p className="mb-0 text-muted"><span className={`badge bg-light ${leadsPercentageChange >= 0 ? 'text-success' : 'text-danger'} mb-0`}>
                                        <i className={`ri-arrow-${leadsPercentageChange >= 0 ? 'up' : 'down'}-line align-middle`}></i> {Math.abs(leadsPercentageChange)} %
                                    </span> vs. previous month</p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="trending-up"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="card-animate same-height padded-card">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-semibold text-muted mb-0">Conversion Rate</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={leadsData.conversionRate}
                                                decimals={2}
                                                duration={4}
                                            />
                                        </span>%</h2>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="percent"
                                                className="text-info"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Card>
                <CardBody>
                    <Row>
                        {leads.map((lead, key) => {
                            const student = students[lead.studentId] || {};
                            return (
                                <Col xxl={3} sm={6} key={key}>
                                    <Card className={`profile-project-card shadow-none profile-project-${lead.status === 'NEW' ? 'danger' : lead.status === 'IN_PROGRESS' ? 'warning' : 'success'}`}>
                                        <CardBody className="p-4">
                                            <div className="d-flex">
                                                <div className="flex-grow-1 text-muted overflow-hidden">
                                                    <h5 className="fs-15 text-truncate">
                                                        <Link to="#" className="text-body">{student.name || 'Unknown'}</Link>
                                                    </h5>
                                                    <p className="text-muted text-truncate mb-0">Created At: <span className="fw-semibold text-body">{new Date(lead.createdAt).toLocaleDateString()}</span></p>
                                                </div>
                                                <div className="flex-shrink-0 ms-2">
                                                    <div className={`badge ${getBadgeClass(lead.status)} fs-12`}>
                                                        {lead.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                </CardBody>
            </Card>
        </React.Fragment>
    );
};

export default Leads;