import React, { useEffect, useState, useCallback } from "react";
import Select from "react-select";
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
import * as CollaboratorAPI from "../ApiCalls/CollaboratorAPI";

export default function Collaborators() {
  document.title = "Chek Review";

  // State management
  const [isEdit, setIsEdit] = useState(false);
  const [collaborators, setCollaborator] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState([]);
  const [collaboratorAdded, setCollaboratorAdded] = useState(false);
  const [modal, setModal] = useState(false);
  const [info, setInfo] = useState([]);
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get all collaborators
  const getAllCollaborators = async () => {
    try {
      const response = await axiosWithToken.get("/collaborators");
      if (response.data != null) {
        return response.data.data;
      } else {
        // console.log("No collaborators found");
        return [];
      }
    } catch (error) {
      console.error("Error getting collaborators:", error);
      throw error;
    }
  };

  // Get roles
  const getAllRoles = async () => {
    try {
      const response = await axiosWithToken.get("/roles");
      if (response.data != null) {
        const roles = response.data.data.map((role) => ({
          label: role.role_name,
          value: role.id,
        }));
        setRoles(roles);
      } else {
        // console.log("No Role found");
        return [];
      }
    } catch (error) {
      console.error("Error getting roles:", error);
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const collaboratorsData = await getAllCollaborators();
      await getAllRoles();
      setCollaborator(collaboratorsData);
      if (!info.id && collaboratorsData.length > 0) {
        setIsEdit(false);
        setInfo(collaboratorsData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch collaborators:", error);
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
      setSelectedCollaborator(null);
    } else {
      setModal(true);
    }
  }, [modal]);

  const toggleViewModal = useCallback(() => {
    setViewModal(!viewModal);
  }, [viewModal]);

  const handleCollaboratorClicks = () => {
    setSelectedCollaborator("");
    setIsEdit(false);
    toggle();
  };

  // create
  const addCollaborator = async (newCollaborator) => {
    try {
      await CollaboratorAPI.addCollaboratorRequest(newCollaborator);
      setCollaborator(collaborators);
      setCollaboratorAdded(true);
      setIsEdit(false);
      toast.success("Collaborateur ajouté avec succés");
      setModal(false);
    } catch (error) {
      toast.error("Echec de l'ajout du collaborateur");
      console.error("Error adding collaborateur:", error);
    }
  };

  useEffect(() => {
    if (collaboratorAdded) {
      fetchData();
      setCollaboratorAdded(false);
    }
  }, [collaboratorAdded]);

  // Update
  const handleCollaboratorClick = useCallback(
    (arg) => {
      const selectedCollaborator = arg;

      setSelectedCollaborator({
        id: selectedCollaborator.id,
        name: selectedCollaborator.name,
        email: selectedCollaborator.email,
        roles: selectedCollaborator.roles || [],
      });

      setIsEdit(true);
      toggle();
    },
    [toggle]
  );

  const handleUpdateCollaborator = async (id, updateCollaborator) => {
    try {
      const response = await CollaboratorAPI.updateCollaboratorRequest(
        id,
        updateCollaborator
      );
      const updatedL = {
        ...response,
        id: id,
        statuses: response.status ? [transformStatus(response.status)] : [],
      };
      setCollaborator(
        collaborators.map((collaborator) =>
          collaborator._id === id ? updatedL : collaborator
        )
      );
      setCollaboratorAdded(true);
      setIsEdit(false);
      setModal(false);
      toast.success("Collaborateur mis à jour avec succès");
    } catch (error) {
      toast.error("Échec de la mise à jour du collaborateur.");
    }
  };

  // export csv
  const headers = [
    { id: "name", displayName: "Collaborateurs" },
    { id: "email", displayName: "Email" },
    { id: "roles", displayName: "Rôles" },
  ];

  // validation
  const validation = useFormik({
    enableReinitialize: true,

    initialValues: {
      id: selectedCollaborator ? selectedCollaborator.id : "0",
      name: (selectedCollaborator && selectedCollaborator.name) || "",
      email: (selectedCollaborator && selectedCollaborator.email) || "",
      role:
        selectedCollaborator && selectedCollaborator.roles
          ? selectedCollaborator.roles.map((role) => ({
              label: role,
              value: role,
            }))
          : [],
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Veuillez indiquer le nom du collaborateur"),
      email: Yup.string()
        .email("Email invalide")
        .required("Veuillez fournir un email."),
      role: Yup.array().min(1, "Veuillez choisir au moins un rôle."),
    }),

    onSubmit: (values) => {
      const selectedRoles = values.role.map((role) => role.label);
      if (isEdit) {
        const updateCollaborator = {
          id: selectedCollaborator ? selectedCollaborator.id : 0,
          name: values.name,
          email: values.email,
          roles: selectedRoles,
        };
        const id = selectedCollaborator.id;
        handleUpdateCollaborator(id, updateCollaborator);
        validation.resetForm();
      } else {
        const newCollaborator = {
          name: values.name,
          email: values.email,
          password: values.password,
          roles: selectedRoles,
        };
        addCollaborator(newCollaborator);
        validation.resetForm();
      }
    },
  });

  const columns = [
    {
      header: "Nom",
      accessorKey: "name",
      enableColumnFilter: false,
      cell: (cell) => (
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 name">{cell.getValue()}</div>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      enableColumnFilter: false,
    },
    {
      header: "Rôles",
      accessorKey: "roles",
      enableColumnFilter: false,
      cell: (cell) => {
        return <div>{cell.getValue().join(", ")}</div>;
      },
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
                const collaboratorData = cellProps.row.original;
                setInfo(collaboratorData);
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
              onClick={() => handleCollaboratorClick(cellProps.row.original)}
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
          data={collaborators.map((collaborator) => ({
            name: String(collaborator.name),
            email: String(collaborator.email),
            roles: (collaborator.roles || []).join(", "),
          }))}
          headers={headers}
          filename={"Collaborateurs"}
        />

        <Container fluid>
          <BreadCrumb title="Collaborators" pageTitle="CRM" />
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
                        Ajouter un collaborateur
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
                      data={collaborators || []}
                      isGlobalFilter={true}
                      isAddUserList={false}
                      customPageSize={8}
                      className="custom-header-css"
                      divClass="table-responsive table-card mb-3"
                      tableClass="align-middle table-nowrap"
                      theadClass="table-light"
                      handleCollaboratorClick={handleCollaboratorClicks}
                      isCollaboratorsFilter={true}
                      SearchPlaceholder="Rechercher un collaborator..."
                    />
                  )}
                  <Modal id="showModal" isOpen={modal} toggle={toggle} centered>
                    <ModalHeader className="bg-info-subtle p-3" toggle={toggle}>
                      {!!isEdit
                        ? "Modifier le collaborateur"
                        : "Ajouter un collaborateur"}
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
                                htmlFor="observation_id-field"
                                className="form-label"
                              >
                                Email
                              </Label>
                              <Input
                                name="email"
                                id="observation_id-field"
                                className="form-control"
                                placeholder="Email..."
                                type="text"
                                validate={{
                                  required: { value: true },
                                }}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.email || ""}
                                invalid={
                                  validation.touched.email &&
                                  validation.errors.email
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.email &&
                              validation.errors.email ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.email}
                                </FormFeedback>
                              ) : null}
                            </div>
                          </Col>
                          <Col lg={12}>
                            <div>
                              <Label
                                htmlFor="password-field"
                                className="form-label"
                              >
                                Mot de passe
                              </Label>
                              <Input
                                name="password"
                                id="customername-field"
                                className="form-control"
                                placeholder="Mot de passe..."
                                type="text"
                                validate={{
                                  required: { value: true },
                                }}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.password || ""}
                                invalid={
                                  validation.touched.password &&
                                  validation.errors.password
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.password &&
                              validation.errors.password ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.password}
                                </FormFeedback>
                              ) : null}
                            </div>
                          </Col>
                          <Col md="12">
                            <Label for="role">Rôles</Label>
                            <Select
                              isMulti
                              id="role"
                              name="role"
                              options={roles}
                              value={validation.values.role}
                              onChange={(option) =>
                                validation.setFieldValue("role", option)
                              }
                              onBlur={validation.handleBlur}
                              className={
                                validation.touched.role &&
                                validation.errors.role
                                  ? "is-invalid"
                                  : ""
                              }
                            />
                            {validation.touched.role &&
                            validation.errors.role ? (
                              <FormFeedback>
                                {validation.errors.role[0]}{" "}
                              </FormFeedback>
                            ) : null}
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

            {/* :::::::::::::::::::::: VIEW Collaborator :::::::::::::::::::::::::: */}
            <Modal
              id="viewModal"
              isOpen={viewModal}
              toggle={toggleViewModal}
              centered
            >
              <ModalHeader
                className="bg-info-subtle p-3"
                toggle={toggleViewModal}
              >
                Consulter
              </ModalHeader>
              <ModalBody>
                <div>
                  <div className="mb-4">
                    <h5 className="mt-4 ">{info.name}</h5>
                  </div>
                  <div>
                    <div className="table-responsive table-card">
                      <Table className="table table-borderless mb-0">
                        <tbody>
                          <tr>
                            <td className="fw-medium">Email</td>
                            <td>{info.email}</td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Rôles</td>
                            <td>
                              {info.roles
                                ? info.roles.join(", ")
                                : "Aucun rôle"}
                            </td>
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
