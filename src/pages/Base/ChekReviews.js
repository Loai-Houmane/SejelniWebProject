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

export default function ChekReviews() {
  document.title = "Chek Review";

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentNames, setStudentNames] = useState({});
  const [agencyNames, setAgencyNames] = useState({});
  const [selectedReview, setSelectedReview] = useState(null);
  const [modal, setModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPageData = 7;

  const fetchReviews = async () => {
    try {
      const response = await axiosWithToken.get("/admin/reviews");
      const sortedReviews = response.data.sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (a.status !== "PENDING" && b.status === "PENDING") return 1;
        return new Date(b.date) - new Date(a.date);
      });
      setReviews(sortedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentName = async (id) => {
    try {
      const response = await axiosWithToken.get(`/admin/student-name/${id}`);
      setStudentNames((prev) => ({ ...prev, [id]: response.data.studentName }));
    } catch (error) {
      console.error("Error fetching student name:", error);
    }
  };

  const fetchAgencyName = async (id) => {
    try {
      const response = await axiosWithToken.get(`/admin/agency-name/${id}`);
      setAgencyNames((prev) => ({ ...prev, [id]: response.data.agencyName }));
      console.log(response.data.agencyName);
    } catch (error) {
      console.error("Error fetching agency name:", error);
    }
  };

  const approveReview = async (id) => {
    try {
      await axiosWithToken.post(`/admin/approve-review/${id}`);
      toast.success("Review approved successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
      toast.error("Failed to approve review");
    }
  };

  const rejectReview = async (id) => {
    try {
      await axiosWithToken.post(`/admin/reject-review/${id}`);
      toast.success("Review rejected successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error rejecting review:", error);
      toast.error("Failed to reject review");
    }
  };

  const toggleModal = () => setModal(!modal);

  const handleRowClick = (review) => {
    setSelectedReview(review);
    toggleModal();
  };

  const truncateComment = (comment, maxLength = 50) => {
    if (comment.length > maxLength) {
      return comment.substring(0, maxLength) + "...";
    }
    return comment;
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    reviews.forEach((review) => {
      if (!studentNames[review.studentId]) {
        fetchStudentName(review.studentId);
      }
      if (!agencyNames[review.agencyId]) {
        fetchAgencyName(review.agencyId);
      }
    });
  }, [reviews]);

  const indexOfLast = currentPage * perPageData;
  const indexOfFirst = indexOfLast - perPageData;
  const currentData = useMemo(() => reviews.slice(indexOfFirst, indexOfLast), [indexOfFirst, indexOfLast, reviews]);

  const totalPages = Math.ceil(reviews.length / perPageData);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div style={{ width: '100px', height: '50px', }}></div>
          <Row>
            <Col>
              <Card>
                <CardHeader>
                  <h5>Reviews</h5>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <div className="table-responsive">
                      <Table className="table-hover table-nowrap fixed-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Agency</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentData.map((review) => (
                            <tr key={review.id} onClick={() => handleRowClick(review)}>
                              <td>{studentNames[review.studentId] || "Loading..."}</td>
                              <td>{agencyNames[review.agencyId] || "Loading..."}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {parseFloat(review.rating).toFixed(1)}{" "}
                                  <FaStar color="gold" style={{ marginLeft: '4px' }} />
                                </div>
                              </td>
                              <td>
                                {truncateComment(review.comment)}{" "}
                                {review.comment.length > 50 && (
                                  <Button
                                    color="link"
                                    onClick={(e) => { e.stopPropagation(); handleRowClick(review); }}
                                  >
                                    
                                  </Button>
                                )}
                              </td>

                              <td>
                                <span
                                  className={`badge rounded-pill ${review.status === "PENDING"
                                    ? "bg-warning text-dark"
                                    : review.status === "APPROVED"
                                      ? "bg-success text-light"
                                      : "bg-danger text-light"
                                    }`}
                                >
                                  {review.status}
                                </span>
                              </td>

                              <td>
                                <Button
                                  color="success"
                                  onClick={(e) => { e.stopPropagation(); approveReview(review.id); }}
                                  disabled={review.status === "APPROVED"}
                                  style={{ marginRight: '8px' }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  color="danger"
                                  onClick={(e) => { e.stopPropagation(); rejectReview(review.id); }}
                                  disabled={review.status === "REJECTED"}
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
      {selectedReview && (
        <Modal isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>Review Details</ModalHeader>
          <ModalBody>
            <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Student:</strong> {studentNames[selectedReview.studentId]}</p>
            <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Agency:</strong> {agencyNames[selectedReview.agencyId]}</p>
            <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Rating:</strong> {parseFloat(selectedReview.rating).toFixed(1)} <FaStar color="gold" /></p>
            <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Comment:</strong></p>
            <p>{selectedReview.comment}</p>
            <p><strong style={{ fontWeight: 'bold', color: 'black' }}>Status:</strong> <span className={`badge rounded-pill ${selectedReview.status === "PENDING" ? "bg-warning text-dark" : selectedReview.status === "APPROVED" ? "bg-success text-light" : "bg-danger text-light"}`}>{selectedReview.status}</span></p>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
}