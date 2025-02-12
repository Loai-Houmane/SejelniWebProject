import React, { useEffect, useState } from 'react';
import {
    Card,
    CardBody,
    Col,
    Row,
    Modal,
    ModalHeader,
    ModalBody,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
} from 'reactstrap';
import axiosWithToken from '../../../ApiCalls/axiosWithToken';
import Cookies from "js-cookie";
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './Servicess.css';

const Services = ({ id }) => {

    const roles = Cookies.get("roles");
    console.log("Roles from cookies:", roles);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [modals, setModals] = useState({
        add: false,
        edit: false,
        view: false,
    });
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: '',
        sales: 0,
    });
    const [purchasedServices, setPurchasedServices] = useState([]);
    const [boughtServices, setBoughtServices] = useState([]);

    // Fetch services from the API
    const fetchServices = async () => {
        try {
            const response = await axiosWithToken.get(`/agencies/services/${id}`);
            setServices(response.data || []);
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error("Failed to fetch services. Please try again later.");
        }
    };

    // Check if a service is bought
    const checkIfServiceBought = async (serviceId) => {
        try {
            const response = await axiosWithToken.post('/student/is-service-bought', { serviceId });
            return response.data.isServiceBought;
        } catch (error) {
            console.error("Error checking if service is bought:", error);
            return false;
        }
    };

    const [isSubscribed, setIsSubscribed] = useState(false);
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
        fetchServices();
    }, []);

    useEffect(() => {
        const checkBoughtStatus = async () => {
            const boughtStatus = await Promise.all(services.map(service => checkIfServiceBought(service.id)));
            setBoughtServices(boughtStatus);
        };

        if (services.length > 0) {
            checkBoughtStatus();
        }
    }, [services]);

    // Toggle specific modals
    const toggleModal = (type, service = null) => {
        setSelectedService(service || null);
        setNewService(service || { name: '', description: '', price: '', sales: 0 });
        setModals((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    // Handle input changes for service forms
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewService((prev) => ({ ...prev, [name]: value }));
    };

    // Add a new service
    const handleAddService = async (e) => {
        e.preventDefault();
        try {
            const serviceToAdd = {
                ...newService,
                price: parseFloat(newService.price) || 0,
                sales: parseInt(newService.sales, 10) || 0,
            };
            await axiosWithToken.post('/agencies/service/create', serviceToAdd);
            fetchServices();
            toggleModal('add');
            toast.success("Service added successfully!");
        } catch (error) {
            console.error("Error adding service:", error);
            toast.error("Failed to add service. Please try again later.");
        }
    };

    // Delete a service
    const handleDeleteService = async (serviceId) => {
        try {
            await axiosWithToken.delete(`/agencies/service/delete/${serviceId}`);
            toast.success("Service deleted successfully!");
            fetchServices();
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Failed to delete service. Please try again later.");
        }
    };

    // Modify an existing service
    const handleModifyService = async (e) => {
        e.preventDefault();
        try {
            const serviceToUpdate = {
                ...newService,
                id: parseInt(newService.id, 10), // Ensure id is an integer
                sales: parseInt(newService.sales, 10) || 0, // Ensure sales is an integer
            };
            await axiosWithToken.put(`/agencies/service/update/${serviceToUpdate.id}`, serviceToUpdate);
            fetchServices();
            toggleModal('edit');
            toast.success("Service modified successfully!");
        } catch (error) {
            console.error("Error modifying service:", error);
            toast.error("Failed to modify service. Please try again later.");
        }
    };

    // Handle buying a service
    const handleBuyService = async (service) => {
        try {
            const orderData = {
                serviceDetails: service.description,
                serviceId: service.id,
            };
            await axiosWithToken.post('/student/create-order', orderData);
            setPurchasedServices((prev) => [...prev, service.id]);
            toast.success("Service purchased successfully!");
        } catch (error) {
            console.error("Error purchasing service:", error);
            toast.error("Failed to purchase service. Please try again later.");
        }
    };

    // Calculate sale price
    const calculateSalePrice = (price, sales) => {
        return price - (price * (sales / 100));
    };




    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <Card>
                <CardBody>
                    {roles && roles.includes("AGENCY") && (
                        <Row className="justify-content-center">
                            <Col xxl={3} sm={6}>
                                <Card
                                    className="profile-project-card shadow-none profile-project-danger"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleModal('add')}
                                >
                                    <CardBody className="p-4 d-flex justify-content-center align-items-center">
                                        <FaPlus className="text-danger" size={30} />
                                        <span className="ms-2 text-danger">Add</span>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}
                    <Row>
                        {services.length === 0 ? (
                            <h1>No services</h1>
                        ) : (
                            services.map((service, key) => {
                                const salePrice = calculateSalePrice(service.price, service.sales);
                                const isOnSale = service.sales > 0;
                                const isPurchased = purchasedServices.includes(service.id);
                                const isBought = boughtServices[key];
                                return (
                                    <Col xxl={3} sm={6} key={key}>
                                        <Card
                                            className={`profile-project-card shadow-none profile-project-${isOnSale ? 'warning' : 'success'}`}
                                            onClick={() => toggleModal('view', service)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <CardBody className="p-4">
                                                <div className="d-flex justify-content-between">
                                                    <div className="flex-grow-1 text-muted overflow-hidden">
                                                        <h5 className="fs-15 text-truncate">{service.name}</h5>
                                                        <p className="text-muted text-truncate mb-0">{service.description}</p>
                                                        {service.sales !== 0 && (
                                                            <span className="badge bg-warning text-black position-absolute top-0 end-0 m-2">{service.sales}%</span>
                                                        )}
                                                        <p className="text-muted text-truncate mb-0">
                                                            Price: {isOnSale ? (
                                                                <>
                                                                    <span className="text-decoration-line-through">{service.price.toFixed(2)} $</span>
                                                                    <span className="ms-2">{salePrice.toFixed(2)} $</span>
                                                                </>
                                                            ) : (
                                                                service.price.toFixed(2)
                                                            )}
                                                        </p>
                                                        {roles && roles.includes("STUDENT") && !isPurchased && !isBought && (
                                                            isSubscribed ? (
                                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                                    <Button
                                                                        style={{ width: '100%', maxWidth: '200px', padding: '20x 10px', fontSize: '16px', backgroundColor: isOnSale ? 'orange' : 'green' }}
                                                                        onClick={() => handleBuyService(service)}
                                                                    >
                                                                        Buy
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                                    <Button
                                                                        style={{ width: '100%', maxHeight: '60px', maxWidth: '200px', fontSize: '16px', backgroundColor: isOnSale ? 'orange' : 'green' }}
                                                                        onClick={() => window.location.href = '/pricing'}
                                                                    >
                                                                        You must subscribe to buy
                                                                    </Button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                );
                            })
                        )}
                    </Row>
                </CardBody>
            </Card>

            {/* Add Modal */}
            <Modal isOpen={modals.add} toggle={() => toggleModal('add')}>
                <ModalHeader toggle={() => toggleModal('add')}>Add New Service</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleAddService}>
                        <FormGroup>
                            <Label for="name">Name</Label>
                            <Input type="text" name="name" id="name" value={newService.name} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input type="textarea" name="description" id="description" value={newService.description} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="price">Price</Label>
                            <Input type="number" name="price" id="price" value={newService.price} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="sales">Sales (%)</Label>
                            <Input type="number" name="sales" id="sales" value={newService.sales} onChange={handleInputChange} />
                        </FormGroup>
                        <Button type="submit" color="primary">Add</Button>
                    </Form>
                </ModalBody>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={modals.view} toggle={() => toggleModal('view')}>
                <ModalHeader toggle={() => toggleModal('view')}>{selectedService?.name}</ModalHeader>
                <ModalBody>
                    <p><strong>Description:</strong> {selectedService?.description}</p>
                    <p className="text-muted text-truncate mb-0">
                        Price: {selectedService?.sales > 0 ? (
                            <>
                                <span className="text-decoration-line-through">{selectedService?.price.toFixed(2)} $</span>
                                <span className="ms-2">{(selectedService?.price - (selectedService?.price * (selectedService?.sales / 100))).toFixed(2)} $</span>
                            </>
                        ) : (
                            selectedService?.price.toFixed(2)
                        )}
                    </p>
                    {roles && roles.includes("AGENCY") && (
                        <div className="d-flex justify-content-end">
                            <Button color="link" size="sm" onClick={() => toggleModal('edit', selectedService)}>
                                <FaEdit />
                            </Button>
                            <Button color="link" size="sm" onClick={() => handleDeleteService(selectedService.id)}>
                                <FaTrash />
                            </Button>
                        </div>
                    )}
                </ModalBody>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={modals.edit} toggle={() => toggleModal('edit')}>
                <ModalHeader toggle={() => toggleModal('edit')}>Edit Service</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleModifyService}>
                        <FormGroup>
                            <Label for="name">Name</Label>
                            <Input type="text" name="name" id="name" value={newService.name} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Description</Label>
                            <Input type="textarea" name="description" id="description" value={newService.description} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="price">Price</Label>
                            <Input type="number" name="price" id="price" value={newService.price} onChange={handleInputChange} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="sales">Sales (%)</Label>
                            <Input type="number" name="sales" id="sales" value={newService.sales} onChange={handleInputChange} />
                        </FormGroup>
                        <Button type="submit" color="primary">Save</Button>
                    </Form>
                </ModalBody>
            </Modal>
        </>
    );
};

export default Services;