import React from 'react';
import { Col, Container, Row } from 'reactstrap';

//import Components
import UpgradeAccountNotise from './UpgradeAccountNotise';
import UsersByDevice from './UsersByDevice';
import Widget from './Widget';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import AudiencesMetrics from './AudiencesMetrics';
import AudiencesSessions from './AudiencesSessions';
import LiveUsers from './LiveUsers';
import TopReferrals from './TopReferrals';
import TopPages from './TopPages';
import SalesForecast from './SalesForecast';


const DashboardAnalytics = () => {
    document.title = "Analytics"
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Analytics" pageTitle="Dashboards" />
                    {/* <Row>
                        <Col xxl={5}>
                            <UpgradeAccountNotise />
                            <Widget />
                        </Col>
                        <LiveUsers />
                    </Row> */}
                    {/* <Row>
                        <AudiencesMetrics />
                        <AudiencesSessions />
                    </Row> */}

                    <Row>

                        <UsersByDevice />
                        <SalesForecast />
                        {/* <TopReferrals />
                                <TopPages /> */}
                        <Widget />

                    </Row>

                </Container>
            </div>
        </React.Fragment>
    );
};

export default DashboardAnalytics;