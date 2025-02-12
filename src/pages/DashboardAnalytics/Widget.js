import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col } from 'reactstrap';
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import axiosWithToken from '../../pages/ApiCalls/axiosWithToken';

const Widget = () => {
    const [studentData, setStudentData] = useState({
        thisMonthStudents: 0,
        lastMonthStudents: 0,
        allStudents: 1
    });

    const [reviewData, setReviewData] = useState({
        totalAvgRating: 0,
        thisMonthAvgRating: 0,
        lastMonthAvgRating: 0
    });

    const [leadsData, setLeadsData] = useState({
        thisMonthLeads: 0,
        lastMonthLeads: 0
    });

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await axiosWithToken.get("/admin/subscribedStudents");
                setStudentData(response.data);
            } catch (error) {
                console.error("Error fetching student data:", error);
            }
        };

        const fetchReviewData = async () => {
            try {
                const response = await axiosWithToken.get("/admin/review-ratings");
                setReviewData(response.data);
            } catch (error) {
                console.error("Error fetching review data:", error);
            }
        };

        const fetchLeadsData = async () => {
            try {
                const response = await axiosWithToken.get("/admin/lead-counts");
                setLeadsData(response.data);
            } catch (error) {
                console.error("Error fetching leads data:", error);
            }
        };

        fetchStudentData();
        fetchReviewData();
        fetchLeadsData();
    }, []);

    const studentText = studentData.allStudents === 1 ? 'student' : 'students';
    const percentageChange = ((studentData.thisMonthStudents - studentData.lastMonthStudents) / studentData.lastMonthStudents * 100).toFixed(2);

    const reviewPercentageChange = reviewData.lastMonthAvgRating 
        ? ((reviewData.thisMonthAvgRating - reviewData.lastMonthAvgRating) / reviewData.lastMonthAvgRating * 100).toFixed(2)
        : 0;

    const leadsPercentageChange = leadsData.lastMonthLeads 
        ? ((leadsData.thisMonthLeads - leadsData.lastMonthLeads) / leadsData.lastMonthLeads * 100).toFixed(2)
        : 0;

    return (
        <React.Fragment>
            <Col>
                <Col md={6}>
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-semibold text-muted mb-0">Subscribed Students</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={studentData.allStudents}
                                                duration={4}
                                            />
                                        </span> {studentText}</h2>
                                    <p className="mb-0 text-muted"><span className={`badge bg-light ${percentageChange >= 0 ? 'text-success' : 'text-danger'} mb-0`}>
                                        <i className={`ri-arrow-${percentageChange >= 0 ? 'up' : 'down'}-line align-middle`}></i> {Math.abs(percentageChange)} %
                                    </span> vs. previous month</p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="users"
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
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-semibold text-muted mb-0">Average Rating</p>
                                    <h2 className="mt-4 ff-secondary fw-semibold">
                                        <span className="counter-value">
                                            <CountUp
                                                start={0}
                                                end={reviewData.totalAvgRating}
                                                decimals={1}
                                                duration={4}
                                            />
                                        </span></h2>
                                    <p className="mb-0 text-muted"><span className={`badge bg-light ${reviewPercentageChange >= 0 ? 'text-success' : 'text-danger'} mb-0`}>
                                        <i className={`ri-arrow-${reviewPercentageChange >= 0 ? 'up' : 'down'}-line align-middle`}></i> {Math.abs(reviewPercentageChange)} %
                                    </span> vs. previous month</p>
                                </div>
                                <div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle rounded-circle fs-2">
                                            <FeatherIcon
                                                icon="star"
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
                    <Card className="card-animate">
                        <CardBody>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <p className="fw-semibold text-muted mb-0">Leads</p>
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
            </Col>
        </React.Fragment>
    );
};

export default Widget;