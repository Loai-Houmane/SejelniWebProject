import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Col,
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  ModalFooter,
  Table,
  FormFeedback,
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import Loader from "../../Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExportCSVModal from "../../Components/Common/ExportCSVModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import axiosWithToken from "../ApiCalls/axiosWithToken";
import * as ClientAPI from "../ApiCalls/ClientAPI";
import Cookies from "js-cookie";

export default function Clients() {
  document.title = "Clients";

  // State management
  const [isEdit, setIsEdit] = useState(false);
  const [clients, setClient] = useState([]);
  const [selectedClient, setSelectedClient] = useState([]);
  const [clientAdded, setClientAdded] = useState(false);
  const [modal, setModal] = useState(false);
  const [info, setInfo] = useState([]);
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const roles = Cookies.get("roles");

  // Collaborators
  const getAllCollaborators = async () => {
    try {
      const { data } = await axiosWithToken.get("/collaborators");
      const collaborators = data?.data || [];
      return collaborators;
    } catch (error) {
      console.error("Error getting collaborators:", error);
      throw error;
    }
  };

  // GET CLIENTS BY COLLABORATOR
  const getClientByCollaborator = async () => {
    const token = Cookies.get("accessToken");
    try {
      const response = await axiosWithToken.post(`/clients/collaborator`, {
        collaborator_id: token,
      });
      if (response.data != null) {
        const clients = response.data.map((client) => ({
          ...client,
          _id: client.clientId,
        }));
        return clients;
      } else {
        // console.log("No clients found");
        return [];
      }
    } catch (error) {
      console.error("Error getting clients:", error);
      throw error;
    }
  };

  // GET ALL CLIENTS
  const getAllClients = async () => {
    try {
      const response = await axiosWithToken.get("/clients");
      const collaborators = await getAllCollaborators();
      const collaboratorMap = Object.fromEntries(
        collaborators.map((collaborator) => [
          collaborator.id,
          collaborator.name,
        ])
      );
      if (response.data != null) {
        const clients = response.data.map((client) => ({
          ...client,
          _id: client.clientId,
          collaborator_name:
            collaboratorMap[client.collaborator_id] || "Unknown Collaborator",
        }));
        return clients;
      } else {
        // console.log("No clients found");
        return [];
      }
    } catch (error) {
      console.error("Error getting clients:", error);
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      if (roles && roles.includes("Commercial")) {
        const clientsData = await getClientByCollaborator();
        setClient(clientsData);
      } else if (roles && roles.includes("Administrateur")) {
        const clientsData = await getAllClients();
        setClient(clientsData);
      }
      if (!info.id && clients.length > 0) {
        setIsEdit(false);
        setInfo(clients[0]);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setIsEdit(false);
      setSelectedClient(null);
    } else {
      setModal(true);
    }
  }, [modal]);

  const toggleViewModal = useCallback(() => {
    setViewModal(!viewModal);
  }, [viewModal]);

  const handleClientClicks = () => {
    setSelectedClient("");
    setIsEdit(false);
    toggle();
  };

  // CREATE
  const addClient = async (newClient) => {
    try {
      await ClientAPI.addClientRequest(newClient);
      setClient(clients);
      setClientAdded(true);
      setIsEdit(false);
      setModal(false);
      toast.success("Client ajouté avec succés");
    } catch (error) {
      toast.error("Echec de l'ajout du client");
      console.error("Error adding client:", error);
    }
  };

  useEffect(() => {
    if (clientAdded) {
      fetchData();
      setClientAdded(false);
    }
  }, [clientAdded]);

  // UPDATE
  const handleClientClick = useCallback(
    (arg) => {
      const selectedClient = arg;

      setSelectedClient({
        id: selectedClient.id,
        name: selectedClient.name,
        city: selectedClient.city,
        phone: selectedClient.phone,
        observation: selectedClient.observation,
      });

      setIsEdit(true);
      toggle();
    },
    [toggle]
  );

  const handleUpdateClient = async (id, updateClient) => {
    try {
      const response = await ClientAPI.updateClientRequest(id, updateClient);
      const updatedL = {
        ...response,
        id: id,
        statuses: response.status ? [transformStatus(response.status)] : [],
      };
      setClient(
        clients.map((client) => (client._id === id ? updatedL : client))
      );
      setClientAdded(true);
      setIsEdit(false);
      setModal(false);
      toast.success("Client mis à jour avec succès");
    } catch (error) {
      toast.error("Échec de la mise à jour du client.");
    }
  };

  // EXPORT
  const headers = [
    { id: "name", displayName: "Nom" },
    { id: "observation", displayName: "Observation" },
    { id: "phone", displayName: "Téléphone" },
    { id: "city", displayName: "Ville" },
  ];

  // validation
  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      id: selectedClient ? selectedClient.id : "0",
      name: (selectedClient && selectedClient.name) || "",
      observation: (selectedClient && selectedClient.observation) || "",
      phone: (selectedClient && selectedClient.phone) || "",
      city: (selectedClient && selectedClient.city) || "",
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Veuillez indiquer le nom du client."),
      observation: Yup.string().required("Veuillez fournir une observation."),
      phone: Yup.string().required("Veuillez entrer un numéro de téléphone."),
      city: Yup.string().required("Veuillez indiquer la ville."),
    }),

    onSubmit: (values) => {
      if (isEdit) {
        const updateClient = {
          id: selectedClient ? selectedClient.id : 0,
          name: values.name,
          observation: values.observation,
          phone: values.phone,
          city: values.city,
        };
        const id = selectedClient.id;
        handleUpdateClient(id, updateClient);
        validation.resetForm();
      } else {
        const newClient = {
          name: values["name"],
          observation: values["observation"],
          phone: values["phone"],
          city: values["city"],
          collaborator_id: Cookies.get("accessToken"),
        };
        addClient(newClient);
        validation.resetForm();
      }
    },
  });

  const columns = [
    ...(roles && roles.includes("Administrateur")
      ? [
          {
            header: "Commerciale",
            accessorKey: "collaborator_name",
            enableColumnFilter: false,
          },
        ]
      : []),
    {
      header: "Client",
      accessorKey: "name",
      enableColumnFilter: false,
      cell: (cell) => (
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 name">{cell.getValue()}</div>
        </div>
      ),
    },
    {
      header: "Téléphone",
      accessorKey: "phone",
      enableColumnFilter: false,
    },
    {
      header: "Ville",
      accessorKey: "city",
      enableColumnFilter: false,
    },
    {
      header: "Observation",
      accessorKey: "observation",
      enableColumnFilter: false,
    },
    {
      header: "Action",
      cell: (cellProps) => (
        <ul className="list-inline hstack gap-2 mb-0">
          {/* VIEW */}
          <li className="list-inline-item edit" title="Call">
            <div
              className="dropdown-item"
              href="#"
              onClick={() => {
                const clientData = cellProps.row.original;
                setInfo(clientData);
                toggleViewModal();
              }}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <i className="ri-eye-fill align-bottom me-2 text-muted"></i>
            </div>
          </li>

          {/* UPDATE  */}
          <li className="list-inline-item edit" title="Message">
            <div
              className="dropdown-item edit-item-btn"
              href="#"
              onClick={() => handleClientClick(cellProps.row.original)}
            >
              <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
            </div>
          </li>

          <li className="list-inline-item"></li>
        </ul>
      ),
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <ExportCSVModal
          show={isExportCSV}
          onCloseClick={() => setIsExportCSV(false)}
          data={clients.map((client) => ({
            clientId: String(client.clientId),
            name: String(client.name),
            observation: String(client.observation),
            phone: String(client.phone),
            city: String(client.city),
          }))}
          headers={headers}
          filename={"Clients"}
        />

        <Container fluid>
          <BreadCrumb title="Clients" pageTitle="CRM" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <div className="flex-grow-1">
                      <button
                        className="btn btn-info add-btn"
                        onClick={() => {
                          setModal(true);
                        }}
                      >
                        <i className="ri-add-fill me-1 align-bottom"></i>
                        Ajouter un client
                      </button>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="hstack text-nowrap gap-2">
                        <button
                          className="btn btn-soft-success"
                          onClick={() => setIsExportCSV(true)}
                        >
                          Exporter
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Col>
            <Col xxl={12}>
              <Card id="contactList">
                <CardBody className="pt-0">
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <TableContainer
                      columns={columns}
                      data={clients || []}
                      isGlobalFilter={true}
                      isAddUserList={false}
                      customPageSize={8}
                      className="custom-header-css"
                      divClass="table-responsive table-card mb-3"
                      tableClass="align-middle table-nowrap"
                      theadClass="table-light"
                      handleClientClick={handleClientClicks}
                      isClientsFilter={true}
                      SearchPlaceholder="Rechercher un client..."
                    />
                  )}
                  {/* :::::::::::::::::::::: ADD / UPDATE MODAL :::::::::::::::::::::::::: */}
                  <Modal id="showModal" isOpen={modal} toggle={toggle} centered>
                    <ModalHeader className="bg-info-subtle p-3" toggle={toggle}>
                      {!!isEdit ? "Modifier le client" : "Ajouter un client"}
                    </ModalHeader>
                    <Form
                      className="tablelist-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <ModalBody>
                        <Input type="hidden" id="id-field" />
                        <Row className="g-3">
                          <Col lg={12}>
                            <div>
                              <Label
                                htmlFor="name-field"
                                className="form-label"
                              >
                                Nom
                              </Label>
                              <Input
                                name="name"
                                id="customername-field"
                                className="form-control"
                                placeholder="Nom complet..."
                                type="text"
                                validate={{
                                  required: { value: true },
                                }}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.name || ""}
                                invalid={
                                  validation.touched.name &&
                                  validation.errors.name
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.name &&
                              validation.errors.name ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.name}
                                </FormFeedback>
                              ) : null}
                            </div>
                          </Col>
                          <Col lg={12}>
                            <div>
                              <Label
                                htmlFor="city-field"
                                className="form-label"
                              >
                                Ville
                              </Label>
                              <Input
                                name="city"
                                id="city-field"
                                className="form-control"
                                placeholder="Ville..."
                                type="text"
                                validate={{
                                  required: { value: true },
                                }}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.city || ""}
                                invalid={
                                  validation.touched.city &&
                                  validation.errors.city
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.city &&
                              validation.errors.city ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.city}
                                </FormFeedback>
                              ) : null}
                            </div>
                          </Col>
                          <Col lg={12}>
                            <div>
                              <Label
                                htmlFor="observation_id-field"
                                className="form-label"
                              >
                                Observation
                              </Label>
                              <Input
                                name="observation"
                                id="observation_id-field"
                                className="form-control"
                                placeholder="Observation..."
                                type="text"
                                validate={{
                                  required: { value: true },
                                }}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.observation || ""}
                                invalid={
                                  validation.touched.observation &&
                                  validation.errors.observation
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.observation &&
                              validation.errors.observation ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.observation}
                                </FormFeedback>
                              ) : null}
                            </div>
                          </Col>
                          <Col lg={12}>
                            <div>
                              <Label
                                htmlFor="phone-field"
                                className="form-label"
                              >
                                Téléphone
                              </Label>
                              <Input
                                name="phone"
                                id="phone-field"
                                className="form-control"
                                placeholder="Numéro de téléphone"
                                type="text"
                                validate={{
                                  required: { value: true },
                                }}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.phone || ""}
                                invalid={
                                  validation.touched.phone &&
                                  validation.errors.phone
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.phone &&
                              validation.errors.phone ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.phone}
                                </FormFeedback>
                              ) : null}
                            </div>
                          </Col>
                        </Row>
                      </ModalBody>
                      <ModalFooter>
                        <div className="hstack gap-2 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => {
                              setModal(false);
                            }}
                          >
                            Fermer
                          </button>
                          <button
                            type="submit"
                            className="btn btn-success"
                            id="add-btn"
                          >
                            {!!isEdit ? "Modifier" : "Ajouter"}
                          </button>
                        </div>
                      </ModalFooter>
                    </Form>
                  </Modal>
                  <ToastContainer closeButton={false} limit={1} />
                </CardBody>
              </Card>
            </Col>

            {/* :::::::::::::::::::::: VIEW Client :::::::::::::::::::::::::: */}
            <Modal
              id="viewModal"
              isOpen={viewModal}
              toggle={toggleViewModal}
              centered
            >
              <ModalHeader toggle={toggleViewModal}>
                Consulter le client
              </ModalHeader>
              <ModalBody>
                <div id="contact-view-detail">
                  <div className="text-center mb-3">
                    <h5 className="mt-4 mb-1">{info.name}</h5>
                    <p className="text-muted">{info.clientId}</p>

                    <ul className="list-inline mb-0">
                      <li className="list-inline-item avatar-xs">
                        <Link
                          to="#"
                          className="avatar-title bg-success-subtle text-success fs-15 rounded"
                        >
                          <i className="ri-phone-line"></i>
                        </Link>
                      </li>
                      <li className="list-inline-item avatar-xs">
                        <Link
                          to="#"
                          className="avatar-title bg-danger-subtle text-danger fs-15 rounded"
                        >
                          <i className="ri-mail-line"></i>
                        </Link>
                      </li>
                      <li className="list-inline-item avatar-xs">
                        <Link
                          to="#"
                          className="avatar-title bg-warning-subtle text-warning fs-15 rounded"
                        >
                          <i className="ri-question-answer-line"></i>
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="table-responsive table-card">
                      <Table className="table table-borderless mb-0">
                        <tbody>
                          <tr>
                            <td className="fw-medium">Ville</td>
                            <td>{info.city}</td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Observation</td>
                            <td>
                              {info.observation || "tonyanoble@velzon.com"}
                            </td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Numéro de téléphone</td>
                            <td>{info.phone}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={toggleViewModal}
                >
                  Fermer
                </button>
              </ModalFooter>
            </Modal>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}
