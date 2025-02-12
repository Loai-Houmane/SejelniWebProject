// src/pages/Orders.js
import React, { useEffect, useState } from "react";
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
import Loader from "../../../../Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaStar } from "react-icons/fa";
import "./Collaborators.css"; // Import custom CSS
import axiosWithToken from '../../../ApiCalls/axiosWithToken'; // Import axiosWithToken

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modal, setModal] = useState(false);

  const getOrdersByAgency = async () => {
    try {
      const response = await axiosWithToken.get('/agencies/ordersByAgency');
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrdersByAgency();
        setOrders(data);
        setTotalPages(Math.ceil(data.length / 10)); // Assuming 10 orders per page
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleModal = () => setModal(!modal);

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    toggleModal();
  };

  const currentData = orders.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <React.Fragment>
      <div className>
        <Container fluid>
          <Row>
            <Col>
              <Card>
                <CardHeader>
                  <h5>Orders</h5>
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
                            <th>Service</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentData.map((order) => (
                            <tr key={order.id} onClick={() => handleRowClick(order)}>
                              <td>{order.student.firstName} {order.student.lastName}</td>
                              <td>{order.service.name}</td>
                              <td>
                                <span
                                  className={`badge rounded-pill ${order.status === "PENDING"
                                    ? "bg-warning-subtle text-dark"
                                    : order.status === "COMPLETED"
                                      ? "bg-success-subtle text-success"
                                      : "bg-danger-subtle text-danger"
                                    }`}
                                >
                                  {order.status}
                                </span>
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
                              <PaginationLink previous onClick={() => setCurrentPage(currentPage - 1)} style={{ backgroundColor: '#f8f9fa', color: '#000' }} />
                            </PaginationItem>
                            <PaginationItem disabled={currentPage === totalPages}>
                              <PaginationLink next onClick={() => setCurrentPage(currentPage + 1)} style={{ backgroundColor: '#f8f9fa', color: '#000' }} />
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
      {selectedOrder && (
        <Modal isOpen={modal} toggle={toggleModal}>
          <ModalHeader toggle={toggleModal}>Order Details</ModalHeader>
          <ModalBody>
            <p><strong>Student:</strong> {selectedOrder.student.firstName} {selectedOrder.student.lastName}</p>
            <p><strong>Service:</strong> {selectedOrder.service.name}</p>
            <p><strong>Status:</strong> <span className={`badge rounded-pill ${selectedOrder.status === "PENDING" ? "bg-warning-subtle text-dark" : selectedOrder.status === "COMPLETED" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>{selectedOrder.status}</span></p>
            <p><strong>Service Details:</strong> {selectedOrder.serviceDetails}</p>
            <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
          </ModalBody>
        </Modal>
      )}
    </React.Fragment>
  );
}