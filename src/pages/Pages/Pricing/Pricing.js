import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import axiosWithToken from '../../ApiCalls/axiosWithToken';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './price.css';
import Cookies from 'js-cookie';

const Pricing = () => {
    const role = Cookies.get('roles');
    const [activeTab, setActiveTab] = useState('1');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const handleBuy = async () => {
        try {
            const response = await axiosWithToken.post('/student/buy-subscription');
            toast.success("Subscription purchased successfully!", { position: "top-right" });
            setIsSubscribed(true);
        } catch (error) {
            toast.error("Failed to purchase subscription.", { position: "top-right" });
        }
    };

    const checkSubscription = async () => {
        try {
            const response = await axiosWithToken.get('/student/check-subscription');
            console.log(response.data.isActive);
            setIsSubscribed(response.data.isActive);
        } catch (error) {
            setIsSubscribed(false);
        }
    };

    useEffect(() => {
        // if (role === 'STUDENT') {
        //     setIsSubscribed(true);
        // } else {
        //     setIsSubscribed(false);
        // }
        checkSubscription();
    }, [role]);

    return (
        <React.Fragment>
            <div>
                <Container>
                    <ToastContainer />
                    <Row className="justify-content-center mt-5">
                        <Col lg={5}>
                            <div className="text-center mb-4 pb-2">
                                <h4 className="fw-bold fs-22">Choose the plan that's right for you</h4>
                                <p className="text-muted mb-4 fs-15">Simple pricing. No hidden fees. Advanced features for your business.</p>
                            </div>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col xl={20}>
                            <Row>
                                <Col lg={6}>
                                    <Card className="pricing-box ribbon-box right equal-height-card">
                                        <CardBody className="p-4 m-2">
                                            <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                    <h5 className="mb-1 fw-bold">Basic Plan</h5>
                                                    <p className="text-muted mb-0">For ShowCasing</p>
                                                </div>
                                                <div className="avatar-sm">
                                                    <div className="avatar-title bg-light rounded-circle text-primary">
                                                        <i className={"fs-20 " + "ri-book-mark-line icon"}></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4">
                                                <h2><sup><small>$ </small></sup>0<span className="fs-14 text-muted">/Year</span></h2>
                                            </div>
                                            <hr className="my-4 text-muted" />
                                            <div>
                                                <ul className="list-unstyled text-muted vstack gap-3">
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-success me-1">
                                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                navigate Agencies
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-success me-1">
                                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                See Services
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-danger me-1">
                                                                <i className="ri-close-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                Buy Services
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-danger me-1">
                                                                <i className="ri-close-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                Appointment Scheduling
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-danger me-1">
                                                                <i className="ri-close-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                Take Orders
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-danger me-1">
                                                                <i className="ri-close-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                Advanced Research
                                                            </div>
                                                        </div>
                                                    </li>
                                                </ul>
                                                <div className="mt-4">
                                                    <Link to="/login" className="btn btn-soft-success w-100 waves-effect waves-light">Sign up free</Link>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col lg={6}>
                                    <Card className="pricing-box ribbon-box right equal-height-card">
                                        <div className="ribbon-two ribbon-two-danger"><span>Popular</span></div>
                                        <CardBody className="p-4 m-2">
                                            <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                    <h5 className="mb-1 fw-bold">Pro Plan</h5>
                                                    <p className="text-muted mb-0">Advanced features</p>
                                                </div>
                                                <div className="avatar-sm">
                                                    <div className="avatar-title bg-light rounded-circle text-primary">
                                                        <i className={"fs-20 " + "ri-star-line icon"}></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4">
                                                <h2><sup><small>$ </small></sup>999<span className="fs-14 text-muted">/Year</span></h2>
                                            </div>
                                            <hr className="my-4 text-muted" />
                                            <div>
                                                <ul className="list-unstyled text-muted vstack gap-3">
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-success me-1">
                                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                navigate Agencies
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-success me-1">
                                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                See Services
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-success me-1">
                                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                Buy Services
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-success me-1">
                                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                Appointment Scheduling
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-success me-1">
                                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                Take Orders
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li>
                                                        <div className="d-flex">
                                                            <div className="flex-shrink-0 text-success me-1">
                                                                <i className="ri-checkbox-circle-fill fs-15 align-middle"></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                Advanced Research
                                                            </div>
                                                        </div>
                                                    </li>
                                                </ul>
                                                {isSubscribed ? (
                                                    <div className="mt-4">
                                                        <Link to="/login" className="btn btn-soft-success w-100 waves-effect waves-light">Sign up</Link>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4">
                                                        <button onClick={handleBuy} className="btn btn-soft-success w-100 waves-effect waves-light">Buy</button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Pricing;