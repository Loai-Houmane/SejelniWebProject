import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row, Button, Input, Badge, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import axiosWithToken from '../ApiCalls/axiosWithToken';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './stylewww.scss';
import { Link } from 'react-router-dom';
import defaultlaugo from '../../assets/agency.png';
import defaultProfile from '../../assets/person.png';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Select from 'react-select';
import Rating from 'react-rating';
import logo from '../../assets/images/logo-light1.png';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../slices/auth/login/thunk';
import { useNavigate } from 'react-router-dom';
import { RiLogoutBoxRLine } from 'react-icons/ri'; // Import the logout icon
import { BsThreeDotsVertical } from 'react-icons/bs'; // Import the three dots icon
import Cookies from 'js-cookie';
const StudentPage = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const urlStarter = 'http://localhost:3000';
    const [agencies, setAgencies] = useState([]);
    const [filteredAgencies, setFilteredAgencies] = useState([]);
    const [student, setStudent] = useState(null);
    const [rating, setRating] = useState([0, 5]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [filterData, setFilterData] = useState({});
    const [agencyName, setAgencyName] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showStudentCard, setShowStudentCard] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dispatch = useDispatch();
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
    const handleLogout = () => {
        Cookies.remove("accessToken");
        Cookies.remove("roles");
        navigate('/LandingPage');
    };

    const toggleStudentCard = () => {
        setShowStudentCard(!showStudentCard);
    };

    const toggleHistoryModal = () => {
        setShowHistoryModal(!showHistoryModal);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const countryOptions = [
        { value: 'USA', label: 'USA' },
        { value: 'Canada', label: 'Canada' },
        { value: 'UK', label: 'UK' },
        { value: 'Australia', label: 'Australia' },
        { value: 'Germany', label: 'Germany' },
        { value: 'France', label: 'France' },
        { value: 'Italy', label: 'Italy' },
        { value: 'Spain', label: 'Spain' },
        { value: 'Japan', label: 'Japan' },
        { value: 'China', label: 'China' },
        { value: 'India', label: 'India' },
        { value: 'Brazil', label: 'Brazil' },
        { value: 'Mexico', label: 'Mexico' },
        { value: 'South Africa', label: 'South Africa' },
        // Add more countries as needed
    ];

    const getAllAgencies = async () => {
        try {
            const response = await axiosWithToken.get('/agencies/all');
            setAgencies(response.data);
            setFilteredAgencies(response.data); // Initialize filtered agencies
        } catch (error) {
            console.error("Error fetching agencies:", error);
            toast.error('Failed to fetch agencies');
        }
    };

    const getStudentData = async () => {
        try {
            const response = await axiosWithToken.get('/student/me');
            setStudent(response.data);
            setFirstName(response.data.firstName);
            setLastName(response.data.lastName);
        } catch (error) {
            console.error("Error fetching student data:", error);
            toast.error('Failed to fetch student data');
        }
    };

    const handleFilterChange = () => {
        const filters = {
            rating,
            countries: selectedCountries.map(country => country.value),
            name: agencyName
        };
        setFilterData(filters);
        localStorage.setItem('filters', JSON.stringify(filters));

        // Apply filters to agencies
        const filtered = agencies.filter(agency => {
            const matchesRating = agency.avgRating >= filters.rating[0] && agency.avgRating <= filters.rating[1];
            const matchesCountries = filters.countries.length === 0 || filters.countries.some(filterCountry =>
                agency.countries.includes(filterCountry)
            );
            const matchesName = agency.name && agency.name.toLowerCase().includes(filters.name.toLowerCase());
            return matchesRating && matchesCountries && matchesName;
        });
        setFilteredAgencies(filtered);
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (file && allowedTypes.includes(file.type)) {
            setProfilePicture(file);
        } else {
            toast.error('Invalid file type. Please upload a PNG or JPG image.');
        }
    };
    const handleProfilePictureUpload = async () => {
        if (profilePicture) {
            const formData = new FormData();
            formData.append('profilePicture', profilePicture);

            try {
                await axiosWithToken.post('/student/upload-profile-picture', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Profile picture updated successfully');
                getStudentData(); // Refresh student data to show the new profile picture
            } catch (error) {
                console.error('Error uploading profile picture:', error);
                toast.error('Failed to upload profile picture');
            }
        } else {
            toast.error('No profile picture selected');
        }
    };

    const handleUpdateStudent = async () => {
        try {
            await axiosWithToken.put('/student/update', { firstName, lastName });
            toast.success('Profile updated successfully');
            getStudentData(); // Refresh student data to show the updated profile
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    useEffect(() => {
        checkSubscription();
        const savedFilters = localStorage.getItem('filters');
        if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters);
            setRating(parsedFilters.rating);
            setSelectedCountries(parsedFilters.countries.map(country => countryOptions.find(option => option.value === country)));
            setAgencyName(parsedFilters.name || '');
            getAllAgencies(parsedFilters);
        } else {
            getAllAgencies({});
        }
        getStudentData();
    }, []);

    // Find the agency with the highest number of reviews and the highest number of orders
    const topReviewAgency = agencies.reduce((prev, current) => (prev.totalReviews > current.totalReviews) ? prev : current, {});
    const bestSellerAgency = agencies.reduce((prev, current) => (prev.totalOrders > current.totalOrders) ? prev : current, {});

    return (
        <React.Fragment>
            <header className="page-header">
                <Container fluid>
                    <Row className="align-items-center"> {/* Ensure vertical alignment */}
                        <Col>
                            <div className="header-content">
                                <Link to="/landingPage">
                                    <img src={logo} alt="Logo" className="header-logo" />
                                </Link>
                            </div>
                        </Col>
                        <Col className="text-end"> {/* Align content to the right */}
                            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                                <DropdownToggle tag="span" data-toggle="dropdown" aria-expanded={dropdownOpen}>
                                    <BsThreeDotsVertical className="three-dots-icon" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem onClick={toggleStudentCard}>
                                        {showStudentCard ? 'Hide Edit' : 'Edit Profile'}
                                    </DropdownItem>
                                    <DropdownItem onClick={toggleHistoryModal}>
                                        View History
                                    </DropdownItem>
                                    <DropdownItem onClick={handleLogout}>
                                        <RiLogoutBoxRLine className="me-1" /> Logout
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Container>
            </header>

            <div className>
                <Container fluid>
                    <Row>

                        <Col lg={3} className="mb-4">
                            <Card className="student-card">
                                <CardHeader className="card-header-light">
                                    <div className="profile-image">
                                        {student && (
                                            <img src={student.profilePicture ? urlStarter + student.profilePicture : defaultProfile} alt={`${student.firstName} ${student.lastName}`} />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    {student && (
                                        <>
                                            <h3>{student.firstName} {student.lastName}</h3>
                                            {showStudentCard && (
                                                <Form>
                                                    <FormGroup>
                                                        <Label for="firstName">First Name</Label>
                                                        <Input
                                                            type="text"
                                                            id="firstName"
                                                            value={firstName}
                                                            onChange={(e) => setFirstName(e.target.value)}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="lastName">Last Name</Label>
                                                        <Input
                                                            type="text"
                                                            id="lastName"
                                                            value={lastName}
                                                            onChange={(e) => setLastName(e.target.value)}
                                                        />
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="profilePicture">Profile Picture</Label>
                                                        <Input
                                                            type="file"
                                                            id="profilePicture"
                                                            accept=".png, .jpg, .jpeg"
                                                            onChange={handleProfilePictureChange}
                                                        />
                                                    </FormGroup>
                                                    <Button color="primary" onClick={handleUpdateStudent}>Update Profile</Button>
                                                    <Button color="secondary" onClick={handleProfilePictureUpload} className="ms-2">Upload Picture</Button>
                                                </Form>
                                            )}
                                        </>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg={9}>
                            <Row className="agency-rr">
                                {isSubscribed ? (
                                    <Col lg={12} className="mb-4">
                                        <Card className="filter-card">
                                            <CardBody>
                                                <h4>Filter Agencies</h4>
                                                <div className="filter-component">
                                                    <label>Agency Name:</label>
                                                    <Input
                                                        type="text"
                                                        value={agencyName}
                                                        onChange={(e) => setAgencyName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="filter-component">
                                                    <label>Rating: {rating[0]} - {rating[1]}</label>
                                                    <Slider
                                                        range
                                                        min={0}
                                                        max={5}
                                                        step={0.1}
                                                        value={rating}
                                                        onChange={setRating}
                                                    />
                                                </div>
                                                <div className="filter-component">
                                                    <label>Countries:</label>
                                                    <Select
                                                        isMulti
                                                        value={selectedCountries}
                                                        onChange={setSelectedCountries}
                                                        options={countryOptions}
                                                        styles={{
                                                            multiValueLabel: (base) => ({
                                                                ...base,
                                                                color: 'white', // Change this to the color that fits your blue background
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                                <Button color="primary" onClick={handleFilterChange}>Apply Filters</Button>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ) : (
                                    <Col lg={12}>
                                        <Card className="agency-card">
                                            <CardBody>
                                                <h4>Subscription Required</h4>
                                                <p>You need to subscribe to access this filter</p>
                                                <Button color="primary" tag={Link} to="/pricing">Subscribe Now</Button>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                )}
                                {filteredAgencies.map((agency) => (
                                    <Col lg={4} className="mb-4 d-flex" key={agency.id}>
                                        <Card className="agency-card">
                                            <CardHeader className="card-header-light">
                                                <div className="profile-image">
                                                    <img src={agency.logoUrl ? urlStarter + agency.logoUrl : defaultlaugo} alt={agency.name} />
                                                </div>
                                            </CardHeader>
                                            <CardBody>
                                                <Row>
                                                    <Col lg={12} style={{ marginBottom: '20px' }}>
                                                        <h3>{agency.name}</h3>
                                                    </Col>
                                                    <Col lg={12} style={{ marginBottom: '20px' }}>
                                                        <p>
                                                            <strong>Rating:</strong> {agency.avgRating % 1 !== 0 ? agency.avgRating.toFixed(1) : agency.avgRating}{' '}
                                                            <Rating
                                                                initialRating={agency.avgRating}
                                                                readonly
                                                                emptySymbol="mdi mdi-star-outline text-muted"
                                                                fullSymbol="mdi mdi-star text-warning"
                                                            />
                                                            ({agency.totalReviews})
                                                        </p>
                                                    </Col>
                                                    <Col lg={12} style={{ marginBottom: '20px' }}>
                                                        <p><strong>Countries:</strong> {agency.countries.join(', ')}</p>
                                                    </Col>
                                                    <Col lg={12} style={{ marginBottom: '20px' }}>
                                                        {agency.id === topReviewAgency.id && (
                                                            <Badge color="info" className="me-1">Top Review</Badge>
                                                        )}
                                                        {agency.id === bestSellerAgency.id && (
                                                            <Badge color="success">Best Seller</Badge>
                                                        )}
                                                    </Col>
                                                    <Col lg={12} style={{ marginBottom: '20px' }}>
                                                        <Button color="primary" tag={Link} to={`/agencyPage/${agency.id}`}>View Details</Button>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>

                    </Row>
                </Container>
                <ToastContainer />
            </div>

            <Modal isOpen={showHistoryModal} toggle={toggleHistoryModal} className="custom-modal">
                <ModalHeader toggle={toggleHistoryModal}>Student History</ModalHeader>
                <ModalBody>
                    {student && (
                        <>
                            <div className="student-info-row">
                                <div className="student-info-section">
                                    <h5>Orders</h5>
                                    {student.orders.length > 0 ? (
                                        <ul>
                                            {student.orders.map(order => (
                                                <li key={order.id}>
                                                    <p><strong>Status:</strong> {order.status}</p>
                                                    <p><strong>Service Details:</strong> {order.serviceDetails}</p>
                                                    <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                                    <p><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No orders found.</p>
                                    )}
                                </div>

                                <div className="student-info-section">
                                    <h5>Reviews</h5>
                                    {student.reviews.length > 0 ? (
                                        <ul>
                                            {student.reviews.map(review => (
                                                <li key={review.id}>
                                                    <p><strong>Rating:</strong> {review.rating}</p>
                                                    <p><strong>Comment:</strong> {review.comment}</p>
                                                    <p><strong>Status:</strong> {review.status}</p>
                                                    <p><strong>Created At:</strong> {new Date(review.createdAt).toLocaleString()}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No reviews found.</p>
                                    )}
                                </div>

                                <div className="student-info-section">
                                    <h5>Appointments</h5>
                                    {student.appointments.length > 0 ? (
                                        <ul>
                                            {student.appointments.map(appointment => (
                                                <li key={appointment.id}>
                                                    <p><strong>Details:</strong> {appointment.details}</p>
                                                    <p><strong>Date:</strong> {new Date(appointment.date).toLocaleString()}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No appointments found.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
}

export default StudentPage;