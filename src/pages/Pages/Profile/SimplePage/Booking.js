import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
} from 'reactstrap';
import bookingImage from "../../../../assets/booking.png";
import axiosWithToken from '../../../ApiCalls/axiosWithToken';
import Cookies from 'js-cookie';

const Booking = ({ width, height }) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const navigate = useNavigate();

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
        checkSubscription();
    }, []);



    return (
        <Card>
            <CardBody>
                <div style={{ textAlign: 'center' }}>
                    <img src={bookingImage} alt="Booking" style={{ width: "500px", height: "500px" }} />
                    <hr />
                    {isSubscribed ? (
                        <a href="#" style={{ fontSize: '2em', textDecoration: 'underline' }}>Booking Link</a>
                    ) : (
                        <a href="/pricing" style={{ fontSize: '2em', textDecoration: 'underline' }}>You must subscribe first</a>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default Booking;