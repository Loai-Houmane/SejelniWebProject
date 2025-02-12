import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import './FooterStyle.css';

const Footer = () => {
    return (
        <footer className="foooter">
            {/* <Container fluid>
                <Row className="align-items-center">
                    <Col sm={6} className="text-center text-sm-start">
                        &copy; {new Date().getFullYear()} Tridia
                    </Col>
                    <Col sm={6} className="text-center text-sm-end">
                        <div>Design & Develop by Tridia</div>
                    </Col>
                </Row>
            </Container> */}
        </footer>
    );
};

export default Footer;
