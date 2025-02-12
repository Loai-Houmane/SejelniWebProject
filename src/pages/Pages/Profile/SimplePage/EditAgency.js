import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import axiosWithToken from '../../../ApiCalls/axiosWithToken';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EditAgency.css'; // Import custom CSS for additional styling
import { FaTrash } from 'react-icons/fa';

const EditAgency = () => {
    const [agencyData, setAgencyData] = useState({
        name: '',
        description: '',
        Website: '',
        facebook: '',
        instagram: '',
        address: '',
        phoneNumber: '',
        email: '',
        countries: ['Country 1', 'Country 2'],
        logoUrl: ''
    });

    const fetchAgencyData = async () => {
        try {
            const response = await axiosWithToken.get('/agencies/getAgencieByUser');
            setAgencyData(response.data);
        } catch (error) {
            console.error("Error fetching agency data:", error);
        }
    };

    useEffect(() => {
        fetchAgencyData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAgencyData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCountryChange = (index, value) => {
        const updatedCountries = [...agencyData.countries];
        updatedCountries[index] = value;
        setAgencyData(prevState => ({
            ...prevState,
            countries: updatedCountries
        }));
    };

    const handleAddCountry = () => {
        setAgencyData(prevState => ({
            ...prevState,
            countries: [...prevState.countries, '']
        }));
    };

    const handleRemoveCountry = (index) => {
        const updatedCountries = agencyData.countries.filter((_, i) => i !== index);
        setAgencyData(prevState => ({
            ...prevState,
            countries: updatedCountries
        }));
    };
    const handleLogoChange = async (e) => {
        const formData = new FormData();
        formData.append('logo', e.target.files[0]);

        try {
            const response = await axiosWithToken.post('agencies/upload-Logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                const data = response.data;
                setAgencyData(prevState => ({
                    ...prevState,
                    logoUrl: data.logoUrl
                }));
            } else {
                console.error('Failed to upload logo');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const key in agencyData) {
            formData.append(key, agencyData[key]);
        }
        try {
            await axiosWithToken.put('/agencies/update', formData);
            toast.success("Agency information updated successfully", { position: "top-right" });
        } catch (error) {
            console.error("Error updating agency information:", error);
            toast.error("Failed to update agency information", { position: "top-right" });
        }
    };

    return (
        <Container fluid className="edit-agency-container">
            <ToastContainer />
            <Row className="justify-content-center">
                <Col lg={10}>
                    <Card>
                        <CardBody>
                            <h3 className="text-center">Edit Agency Information</h3>
                            <Form onSubmit={handleSubmit}>
                                <Row className="justify-content-center">
                                    <Col md={6} className="text-center">
                                        <FormGroup>
                                            <Label for="logo">Profile Picture</Label>
                                            <Input
                                                type="file"
                                                accept=".jpg,.jpeg,.png"
                                                name="logo"
                                                id="logo"
                                                onChange={handleLogoChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="name">Name</Label>
                                            <Input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={agencyData.name}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="phoneNumber">Phone Number</Label>
                                            <Input
                                                type="text"
                                                name="phoneNumber"
                                                id="phoneNumber"
                                                value={agencyData.phoneNumber}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="email">Email</Label>
                                            <Input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={agencyData.email}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="address">Address</Label>
                                            <Input
                                                type="text"
                                                name="address"
                                                id="address"
                                                value={agencyData.address}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="Website">Website</Label>
                                            <Input
                                                type="text"
                                                name="Website"
                                                id="Website"
                                                value={agencyData.Website}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="facebook">Facebook</Label>
                                            <Input
                                                type="text"
                                                name="facebook"
                                                id="facebook"
                                                value={agencyData.facebook}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="instagram">Instagram</Label>
                                            <Input
                                                type="text"
                                                name="instagram"
                                                id="instagram"
                                                value={agencyData.instagram}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6}>
                                        <FormGroup>
                                            <Label for="description">Description</Label>
                                            <Input
                                                type="textarea"
                                                name="description"
                                                id="description"
                                                value={agencyData.description}
                                                onChange={handleChange}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <FormGroup>
                                            <Label>Countries</Label>
                                            {agencyData.countries.map((country, index) => (
                                                <Row key={index} className="align-items-center">
                                                    <Col md={10}>
                                                        <Input
                                                            type="text"
                                                            value={country}
                                                            onChange={(e) => handleCountryChange(index, e.target.value)}
                                                        />
                                                    </Col>
                                                    <Col md={2}>
                                                        <Button color="danger" onClick={() => handleRemoveCountry(index)} className="padding-bottom">
                                                            <FaTrash />
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            ))}
                                            <Button color="primary" onClick={handleAddCountry}>Add Country</Button>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Button type="submit" color="primary" className="w-100">Save Changes</Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default EditAgency;