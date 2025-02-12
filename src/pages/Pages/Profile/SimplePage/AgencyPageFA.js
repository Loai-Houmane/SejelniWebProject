import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Input, Label, Nav, NavItem, NavLink, Pagination, PaginationItem, PaginationLink, Progress, Row, TabContent, Table, TabPane, UncontrolledCollapse, UncontrolledDropdown, Button } from 'reactstrap';
import classnames from 'classnames';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules"
import SwiperCore from "swiper";
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import Dropzone from 'react-dropzone';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosWithToken from '../../../ApiCalls/axiosWithToken';
//Images
import profileBg from '../../../../assets/images/profile-bg.jpg';
import { FaHeart, FaInstagram, FaFacebook, FaGlobe, FaUpload } from 'react-icons/fa';
import { projects, document } from '../../../../common/data';
import EcommerceSellerDetail from "./EcommerceSellerDetail"; // Import the component
import Leads from "./Leads"; // Import the component
import Services from "./Services"; // Import the component
//import style
import './stylee.scss'
import Oreders from './Orders';
import '@mdi/font/css/materialdesignicons.min.css';
import { faL } from '@fortawesome/free-solid-svg-icons';
import Cookies from "js-cookie";
import defaultAgencyLogo from '../../../../assets/agency.png';
import { useParams } from 'react-router-dom';
const AgencyPageFA = () => {
    //get id fron this page params
    const { id } = useParams();
    const roles = Cookies.get("roles");
    SwiperCore.use([Autoplay]);
    const [agencyData, setAgencyData] = useState(null);
    const [activeTab, setActiveTab] = useState('1');
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [showDropzone, setShowDropzone] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [photoFiles, setPhotoFiles] = useState([]);

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const getAgencyData = async (id) => {
        try {
            const response = await axiosWithToken.get(`/agencies/getAgencie/${id}`);
            setAgencyData(response.data);
        } catch (error) {
            console.error("Error fetching agency data:", error);
        }
    };

    useEffect(() => {
        getAgencyData(id);
    }, []);

    const renderLogo = () => {
        if (agencyData?.logoUrl) {
            return <img src={`http://localhost:3000${agencyData.logoUrl}`} alt="Agency Logo" className="img-thumbnail rounded-circle" />;
        }
        return <img src={defaultAgencyLogo} alt="Default Agency Logo" className="img-thumbnail rounded-circle" />;
    };


    const renderGallery = () => {
        if (agencyData?.photoGallery) {
            return agencyData.photoGallery.map((item, key) => (
                <div key={key} className="col-lg-3 col-md-4 col-6 gallery-item">
                    <div className="gallery-item-wrapper">
                        <img
                            src={`http://localhost:3000${item}`}
                            alt={`Gallery ${key}`}
                            className="img-fluid cursor-pointer"
                            onClick={() => {
                                setPhotoIndex(key);
                                setIsOpen(true);
                            }}
                        />
                    </div>
                </div>
            ));
        }
        return null;
    };

    const handleVideoUpload = async () => {
        if (videoFile) {
            const formData = new FormData();
            formData.append('video', videoFile);

            try {
                const response = await axiosWithToken.post('/agencies/upload-video', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Video uploaded successfully');
                getAgencyData(id); // Refresh the agency data to show the new video
            } catch (error) {
                console.error('Error uploading video:', error);
                toast.error('Failed to upload video');
            }
        } else {
            toast.error('No video file selected');
        }
    };

    const handlePhotoUpload = async () => {
        if (photoFiles.length > 0) {
            const formData = new FormData();
            photoFiles.forEach(file => {
                formData.append('photos', file);
            });

            try {
                const response = await axiosWithToken.post('/agencies/upload-photos', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Photos uploaded successfully');
                getAgencyData(id); // Refresh the agency data to show the new photos
            } catch (error) {
                console.error('Error uploading photos:', error);
                toast.error('Failed to upload photos');
            }
        } else {
            toast.error('No photo files selected');
        }
    };

    document.title = "Profile | Velzon - React Admin & Dashboard Template";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <div className="profile-foreground position-relative mx-n4 mt-n4">
                        <div className="profile-wid-bg">
                            <img src={profileBg} alt="" className="profile-wid-img" />
                        </div>
                    </div>
                    <div className="pt-4 mb-4 mb-lg-3 pb-lg-4">
                        <Row className="g-4 justify-content-center align-items-center">
                            <div className="col-auto">
                                <div className="avatar-lg">
                                    {renderLogo()}
                                </div>
                            </div>
                            <div className="col" style={{ color: '#ffffff' }}>
                                <h3 style={{ marginBottom: '3px', color: '#ffffff' }}>
                                    {agencyData ? agencyData.name : 'Loading...'}
                                </h3>
                                {agencyData && agencyData.countries && (
                                    <div style={{ paddingLeft: '15px', color: '#ffffff' }}>
                                        {agencyData.countries.join(', ')}
                                    </div>
                                )}
                            </div>
                        </Row>
                    </div>

                    <Row>
                        <Col lg={12}>
                            <div>
                                <div className="d-flex">
                                    <Nav pills className="animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1"
                                        role="tablist">
                                        <NavItem>
                                            <NavLink
                                                href="#overview-tab"
                                                className={classnames({ active: activeTab === '1' })}
                                                onClick={() => { toggleTab('1'); }}
                                            >
                                                <i className="ri-airplay-fill d-inline-block d-md-none"></i> <span
                                                    className="d-none d-md-inline-block">Overview</span>
                                            </NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink
                                                href="#services"
                                                className={classnames({ active: activeTab === '2' })}
                                                onClick={() => { toggleTab('2'); }}
                                            >
                                                <i className="ri-list-unordered d-inline-block d-md-none"></i> <span
                                                    className="d-none d-md-inline-block">Services</span>
                                            </NavLink>
                                        </NavItem>
                                        {roles && roles.includes("AGENCY") && (
                                            <>

                                                <NavItem>
                                                    <NavLink
                                                        href="#leads"
                                                        className={classnames({ active: activeTab === '3' })}
                                                        onClick={() => { toggleTab('3'); }}
                                                    >
                                                        <i className="ri-list-unordered d-inline-block d-md-none"></i> <span
                                                            className="d-none d-md-inline-block">Leads</span>
                                                    </NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink
                                                        href="#orders"
                                                        className={classnames({ active: activeTab === '4' })}
                                                        onClick={() => { toggleTab('4'); }}
                                                    >
                                                        <i className="ri-list-unordered d-inline-block d-md-none"></i> <span
                                                            className="d-none d-md-inline-block">Orders</span>
                                                    </NavLink>
                                                </NavItem>
                                            </>
                                        )}
                                    </Nav>
                                    {roles && roles.includes("AGENCY") && (
                                        <div className="flex-shrink-0">
                                            <Link to="/edit-agency" className="btn btn-success">
                                                <i className="ri-edit-box-line align-bottom"></i> Edit Profile
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <TabContent activeTab={activeTab} className="pt-4 text-muted">
                                    <TabPane tabId="1">
                                        <Row>
                                            <Col xxl={3}>
                                                <Card>
                                                    <CardBody>
                                                        <h3 className="align-items-center ">Info</h3>
                                                        <div className="table-responsive">
                                                            <Table className="table-borderless mb-0">
                                                                <tbody>
                                                                    <tr>
                                                                        <th className="ps-0 nowrap" scope="row">Agency Name :</th>
                                                                        <td className="text-muted wrap">{agencyData?.name || 'N/A'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0 nowrap" scope="row">Phone Number :</th>
                                                                        <td className="text-muted wrap">{agencyData?.phoneNumber || 'N/A'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0 nowrap" scope="row">E-mail :</th>
                                                                        <td className="text-muted wrap">{agencyData?.email || 'N/A'}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0 nowrap" scope="row">Address :</th>
                                                                        <td className="text-muted wrap">{agencyData?.address || 'N/A'}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                    </CardBody>
                                                </Card>

                                                <Card>
                                                    <CardBody>
                                                        <h5 className=".card-header-dark">Link</h5>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            <div>
                                                                <a href={agencyData?.Website || '#'} target="_blank" rel="noopener noreferrer" className="avatar-xs d-block">
                                                                    <span className="avatar-title rounded-circle fs-16 bg-body text-body">
                                                                        <FaGlobe />
                                                                    </span>
                                                                </a>
                                                            </div>
                                                            <div>
                                                                <a href={agencyData?.facebook || '#'} target="_blank" rel="noopener noreferrer" className="avatar-xs d-block">
                                                                    <span className="avatar-title rounded-circle fs-16 bg-primary">
                                                                        <FaFacebook />
                                                                    </span>
                                                                </a>
                                                            </div>
                                                            <div>
                                                                <a href={agencyData?.instagram || '#'} target="_blank" rel="noopener noreferrer" className="avatar-xs d-block">
                                                                    <span className="avatar-title rounded-circle fs-16 bg-success">
                                                                        <FaInstagram />
                                                                    </span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                                <EcommerceSellerDetail reviewId={id} />
                                            </Col>
                                            <Col xxl={9}>
                                                <Card>
                                                    <CardBody>
                                                        <h3 className="align-items-center d-flex .card-header-dark">Description</h3>
                                                        <p>{agencyData?.description}</p>
                                                    </CardBody>
                                                </Card>

                                                <Row>
                                                    <Col lg={12}>
                                                        <Card>

                                                            <CardHeader className="align-items-center d-flex card-header-dark">
                                                                <h3>Video Showcase</h3>
                                                                {roles && roles.includes("AGENCY") && (
                                                                    <div className="ms-auto">
                                                                        <div
                                                                            onClick={() => setShowDropzone(!showDropzone)}
                                                                            style={{ cursor: 'pointer' }}
                                                                        >
                                                                            <FaUpload size={20} />
                                                                        </div>
                                                                        {showDropzone && (
                                                                            <Dropzone onDrop={acceptedFiles => setVideoFile(acceptedFiles[0])}>
                                                                                {({ getRootProps, getInputProps }) => (
                                                                                    <div {...getRootProps({ className: 'dropzone minimized-height' })} style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center', borderRadius: '5px' }}>
                                                                                        <input {...getInputProps()} />
                                                                                        <Button color="link" className="btn btn-link p-0">
                                                                                            <FaUpload size={20} /> Drop video here or click to select
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                            </Dropzone>
                                                                        )}
                                                                        {videoFile && (
                                                                            <div style={{ marginTop: '10px' }}>
                                                                                <p>Video selected: {videoFile.name}</p>
                                                                                <Button color="primary" onClick={handleVideoUpload}>Send</Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </CardHeader>
                                                            <CardBody>
                                                                {agencyData?.videoUrl && (
                                                                    <video width="100%" controls>
                                                                        <source src={`http://localhost:3000${agencyData.videoUrl}`} type="video/mp4" />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                )}
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                    <Col lg={12}>
                                                        <Card>
                                                            <CardHeader className="align-items-center d-flex card-header-dark">
                                                                <h3>Photo Gallery</h3>
                                                                {roles && roles.includes("AGENCY") && (
                                                                    <div className="ms-auto">
                                                                        <div
                                                                            onClick={() => setShowDropzone(!showDropzone)}
                                                                            style={{ cursor: 'pointer' }}
                                                                        >
                                                                            <FaUpload size={20} />
                                                                        </div>
                                                                        {showDropzone && (
                                                                            <Dropzone onDrop={acceptedFiles => setPhotoFiles(acceptedFiles)}>
                                                                                {({ getRootProps, getInputProps }) => (
                                                                                    <div {...getRootProps({ className: 'dropzone minimized-height' })} style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center', borderRadius: '5px' }}>
                                                                                        <input {...getInputProps()} />
                                                                                        <Button color="link" className="btn btn-link p-0">
                                                                                            <FaUpload size={20} /> Drop photos here or click to select
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                            </Dropzone>
                                                                        )}
                                                                        {photoFiles.length > 0 && (
                                                                            <div style={{ marginTop: '10px' }}>
                                                                                <p>{photoFiles.length} photo(s) selected</p>
                                                                                <Button color="primary" onClick={handlePhotoUpload}>Upload Photos</Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </CardHeader>
                                                            <CardBody>
                                                                <Row>
                                                                    {renderGallery()}
                                                                </Row>
                                                            </CardBody>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </TabPane>

                                    <TabPane tabId="2">
                                        <Services id={id} />
                                    </TabPane>
                                    <TabPane tabId="3">
                                        <Leads />
                                    </TabPane>
                                    <TabPane tabId="4">
                                        <Oreders />
                                    </TabPane>
                                </TabContent>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            {isOpen && (
                <Lightbox 
                    mainSrc={`http://localhost:3000${agencyData.photoGallery[photoIndex]}`}
                    nextSrc={`http://localhost:3000${agencyData.photoGallery[(photoIndex + 1) % agencyData.photoGallery.length]}`}
                    prevSrc={`http://localhost:3000${agencyData.photoGallery[(photoIndex + agencyData.photoGallery.length - 1) % agencyData.photoGallery.length]}`}
                    onCloseRequest={() => setIsOpen(false)}
                    onMovePrevRequest={() =>
                        setPhotoIndex((photoIndex + agencyData.photoGallery.length - 1) % agencyData.photoGallery.length)
                    }
                    onMoveNextRequest={() =>
                        setPhotoIndex((photoIndex + 1) % agencyData.photoGallery.length)
                    }
                />
            )}
            <ToastContainer />
        </React.Fragment>
    );
};

export default AgencyPageFA;