import React, { useEffect, useState, useMemo } from "react";
import {
    Col,
    Container,
    Row,
    Card,
    CardHeader,
    CardBody,
    Table,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Pagination,
    PaginationItem,
    PaginationLink,
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import Loader from "../../Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosWithToken from "../ApiCalls/axiosWithToken";
import { FaStar } from "react-icons/fa";
import "./ChekReviews.css"; // Import custom CSS

export default function Agence() {
    document.title = "Check Agency";

    const [agencies, setAgencies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [modal, setModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const perPageData = 7;

    const fetchAgencies = async () => {
        try {
            const response = await axiosWithToken.get("/agencies/allAdmin");
            const sortedAgencies = response.data.sort((a, b) => {
                if (a.status === "PENDING" && b.status !== "PENDING") return -1;
                if (a.status !== "PENDING" && b.status === "PENDING") return 1;
                return new Date(b.date) - new Date(a.date);
            });
            setAgencies(sortedAgencies);
        } catch (error) {
            console.error("Error fetching agencies:", error);
            toast.error("Failed to fetch agencies");
        } finally {
            setIsLoading(false);
        }
    };

    const approveAgency = async (id) => {
        try {
            await axiosWithToken.post(`/admin/approve-agency/${id}`);
            toast.success("Agency approved successfully");
            fetchAgencies();
        } catch (error) {
            console.error("Error approving agency:", error);
            toast.error("Failed to approve agency");
        }
    };

    const rejectAgency = async (id) => {
        try {
            await axiosWithToken.post(`/admin/reject-agency/${id}`);
            toast.success("Agency rejected successfully");
            fetchAgencies();
        } catch (error) {
            console.error("Error rejecting agency:", error);
            toast.error("Failed to reject agency");
        }
    };

    const toggleModal = () => setModal(!modal);

    const handleRowClick = (agency) => {
        setSelectedAgency(agency);
        toggleModal();
    };

    const truncateDescription = (description, maxLength = 50) => {
        if (!description) {
            return "";
        }
        if (description.length > maxLength) {
            return description.substring(0, maxLength) + "...";
        }
        return description;
    };

    useEffect(() => {
        fetchAgencies();
    }, []);

    const indexOfLast = currentPage * perPageData;
    const indexOfFirst = indexOfLast - perPageData;
    const currentData = useMemo(() => agencies.slice(indexOfFirst, indexOfLast), [indexOfFirst, indexOfLast, agencies]);

    const totalPages = Math.ceil(agencies.length / perPageData);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <div style={{ width: '100px', height: '50px', }}></div>
                    <Row>
                        <Col>
                            <Card>
                                <CardHeader>
                                    <h5>Agencies</h5>
                                </CardHeader>
                                <CardBody>
                                    {isLoading ? (
                                        <Loader />
                                    ) : (
                                        <div className="table-responsive">
                                            <Table className="table-hover table-nowrap fixed-table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Description</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentData.map((agency) => (
                                                        <tr key={agency.id} onClick={() => handleRowClick(agency)}>
                                                            <td><a href={`/agencyPageFA/${agency.id}`}>{agency.name}</a></td>
                                                            <td>{agency.email}</td>
                                                            <td>{truncateDescription(agency.description)}</td>
                                                            <td>
                                                                <span
                                                                    className={`badge rounded-pill ${agency.status === "PENDING"
                                                                        ? "bg-warning text-dark"
                                                                        : agency.status === "APPROVED"
                                                                            ? "bg-success text-light"
                                                                            : "bg-danger text-light"
                                                                        }`}
                                                                >
                                                                    {agency.status}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    color="success"
                                                                    onClick={(e) => { e.stopPropagation(); approveAgency(agency.id); }}
                                                                    disabled={agency.status === "APPROVED"}
                                                                    style={{ marginRight: '8px' }}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    color="danger"
                                                                    onClick={(e) => { e.stopPropagation(); rejectAgency(agency.id); }}
                                                                    disabled={agency.status === "REJECTED"}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            <Row className="align-items-center mt-2 g-3 text-center text-sm-start">
                                                <Col className="col-sm">
                                                    <div className="text-muted">Showing <span className="fw-semibold">{currentPage}</span> of <span className="fw-semibold">{totalPages}</span> Pages</div>
                                                </Col>
                                                <Col className="col-sm-auto" style={{ margin: '10px' }}>
                                                    <Pagination className="pagination-separated pagination-md justify-content-center justify-content-sm-start mb-0">
                                                        <PaginationItem disabled={currentPage === 1}>
                                                            <PaginationLink
                                                                previous
                                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                                style={{ color: '#000', backgroundColor: '#fff', borderColor: '#ccc' }}
                                                            />
                                                        </PaginationItem>
                                                        <PaginationItem disabled={currentPage === totalPages}>
                                                            <PaginationLink
                                                                next
                                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                                style={{ color: '#000', backgroundColor: '#fff', borderColor: '#ccc' }}
                                                            />
                                                        </PaginationItem>
                                                    </Pagination>
                                                </Col>
                                            </Row>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
            <ToastContainer />
            {selectedAgency && (
                <Modal isOpen={modal} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>Agency Details</ModalHeader>
                    <ModalBody>
                        <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Name:</strong> {selectedAgency.name}</p>
                        <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Email:</strong> {selectedAgency.email}</p>
                        <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Description:</strong></p>
                        <p>{selectedAgency.description}</p>
                        <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Status:</strong> <span className={`badge rounded-pill ${selectedAgency.status === "PENDING" ? "bg-warning text-dark" : selectedAgency.status === "APPROVED" ? "bg-success text-light" : "bg-danger text-light"}`}>{selectedAgency.status}</span></p>
                    </ModalBody>
                </Modal>
            )}
        </React.Fragment>
    );
}