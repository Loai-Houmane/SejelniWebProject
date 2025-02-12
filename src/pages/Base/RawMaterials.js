import React, { useEffect, useState, useCallback } from "react";
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
import Cookies from "js-cookie";
import * as MatierePremiereAPI from "../ApiCalls/MatierePremiereAPI";
import moment from "moment";

export default function MatierePremieres() {
  document.title = "Matières Premières";

  // State management
  const [isEdit, setIsEdit] = useState(false);
  const [matierePremieres, setMatierePremieres] = useState([]);
  const [selectedMatierePremiere, setSelectedMatierePremiere] = useState([]);
  const [matierePremieresAdded, setMatierePremieresAdded] = useState(false);
  const [modal, setModal] = useState(false);
  const [info, setInfo] = useState([]);
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get all matieres premieres
  const getAllMatierePremieres = async () => {
    try {
      const response = await axiosWithToken.get("/matiere-premiere");
      if (response.data != null) {
        const matierePremieres = response.data.map((matierePremiere) => ({
          ...matierePremiere,
          id: matierePremiere.id,
        }));

        return matierePremieres;
      } else {
        // console.log("No matierePremieres found");
        return [];
      }
    } catch (error) {
      console.error("Error getting matierePremieres:", error);
      throw error;
    }
  };

  const fetchData = async () => {
    try {
      const matierePremieresData = await getAllMatierePremieres();
      setMatierePremieres(matierePremieresData);
      if (!info.id && matierePremieresData.length > 0) {
        setIsEdit(false);
        setInfo(matierePremieresData[0]);
      }
    } catch (error) {
      console.error("Failed to fetch matierePremieres:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // HANDLERS
  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setIsEdit(false);
      setSelectedMatierePremiere(null);
    } else {
      setModal(true);
    }
  }, [modal]);

  const toggleViewModal = useCallback(() => {
    setViewModal(!viewModal);
  }, [viewModal]);

  const handleMatierePremieresClicks = () => {
    setSelectedMatierePremiere("");
    setIsEdit(false);
    toggle();
  };

  // CREATE
  const addMatierePremieres = async (newMatierePremieres) => {
    try {
      await MatierePremiereAPI.addMatierePremiereRequest(newMatierePremieres);
      setMatierePremieres(matierePremieres);
      setMatierePremieresAdded(true);
      setIsEdit(false);
      setModal(false);
      toast.success("Matière première ajoutée avec succés");
    } catch (error) {
      toast.error("Échec de l'ajout de la matière première.");
      console.error("Error adding MatierePremieres:", error);
    }
  };

  useEffect(() => {
    if (matierePremieresAdded) {
      fetchData();
      setMatierePremieresAdded(false);
    }
  }, [matierePremieresAdded]);

  // UPDATE
  const handleMatierePremieresClick = useCallback(
    (arg) => {
      const selectedMatierePremiere = arg;

      setSelectedMatierePremiere({
        id: selectedMatierePremiere.id,
        name: selectedMatierePremiere.name,
        quantity: selectedMatierePremiere.quantity,
        createdAt: selectedMatierePremiere.createdAt,
        observation: selectedMatierePremiere.observation,
      });

      setIsEdit(true);
      toggle();
    },
    [toggle]
  );

  const handleUpdateMatierePremiere = async (id, updateMatierePremieres) => {
    try {
      const response = await MatierePremiereAPI.updateMatierePremiereRequest(
        id,
        updateMatierePremieres
      );
      const updatedL = {
        ...response,
        id: id,
        statuses: response.status ? [transformStatus(response.status)] : [],
      };
      setMatierePremieres(
        matierePremieres.map((matierePremieres) =>
          matierePremieres._id === id ? updatedL : matierePremieres
        )
      );
      setMatierePremieresAdded(true);
      setIsEdit(false);
      setModal(false);
      toast.success("Matière première mise à jour avec succés");
    } catch (error) {
      toast.error("Échec de la mise à jour de la matière première.");
    }
  };

  // EXPORT
  const headers = [
    { id: "createdAt", displayName: "Date" },
    { id: "name", displayName: "Nom" },
    { id: "observation", displayName: "Observation" },
    { id: "quantity", displayName: "Quantité" },
  ];

  // Validation
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: selectedMatierePremiere ? selectedMatierePremiere.id : "0",
      createdAt:
        (selectedMatierePremiere && selectedMatierePremiere.createdAt) || "",
      name: (selectedMatierePremiere && selectedMatierePremiere.name) || "",
      observation:
        (selectedMatierePremiere && selectedMatierePremiere.observation) || "",
      quantity:
        (selectedMatierePremiere && selectedMatierePremiere.quantity) || "",
    },

    validationSchema: Yup.object({
      name: Yup.string().required(
        "Veuillez indiquer le nom du matière première"
      ),
      observation: Yup.string().required("Veuillez fournir une observation."),
      quantity: Yup.string().required("Veuillez entrer la quantité"),
    }),

    onSubmit: (values) => {
      if (isEdit) {
        const updateMatierePremieres = {
          id: selectedMatierePremiere ? selectedMatierePremiere.id : 0,
          collaborator_id: Cookies.get("accessToken"),
          name: values.name,
          observation: values.observation,
          quantity: values.quantity,
        };
        const id = selectedMatierePremiere.id;
        handleUpdateMatierePremiere(id, updateMatierePremieres);
        validation.resetForm();
      } else {
        const newMatierePremieres = {
          name: values["name"],
          observation: values["observation"],
          quantity: values["quantity"],
          collaborator_id: Cookies.get("accessToken"),
        };
        addMatierePremieres(newMatierePremieres);
        validation.resetForm();
      }
    },
  });

  const columns = [
    {
      header: "Date",
      accessorKey: "createdAt",
      enableColumnFilter: false,
      cell: (cell) => (
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 name">
            {new Date(cell.getValue()).toISOString().split("T")[0]}
          </div>
        </div>
      ),
    },
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
      header: "Observation",
      accessorKey: "observation",
      enableColumnFilter: false,
    },
    {
      header: "Quantité",
      accessorKey: "quantity",
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
                const matierePremieresData = cellProps.row.original;
                setInfo(matierePremieresData);
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
              onClick={() =>
                handleMatierePremieresClick(cellProps.row.original)
              }
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
          data={matierePremieres.map((matierePremieres) => ({
            matierePremieresId: String(matierePremieres.matierePremieresId),
            createdAt: new Date(matierePremieres.createdAt)
              .toISOString()
              .split("T")[0],
            name: String(matierePremieres.name),
            observation: String(matierePremieres.observation),
            quantity: String(matierePremieres.quantity),
          }))}
          headers={headers}
          filename={"MatierePremieres"}
        />

        <Container fluid>
          <BreadCrumb title="Matières Premières" pageTitle="CRM" />
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
                          setIsEdit(false);
                        }}
                      >
                        <i className="ri-add-fill me-1 align-bottom"></i>
                        Ajouter une matière première
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
                  {/* :::::::::::::::::::::: LIST MatierePremieres :::::::::::::::::::::::::: */}

                  {isLoading ? (
                    <Loader />
                  ) : (
                    <TableContainer
                      columns={columns}
                      data={matierePremieres || []}
                      isGlobalFilter={true}
                      isAddUserList={false}
                      customPageSize={8}
                      className="custom-header-css"
                      divClass="table-responsive table-card mb-3"
                      tableClass="align-middle table-nowrap"
                      theadClass="table-light"
                      handleMatierePremieresClick={handleMatierePremieresClicks}
                      isMatierePremieresFilter={true}
                      SearchPlaceholder="Rechercher une matière première..."
                    />
                  )}

                  {/* :::::::::::::::::::::: ADD / UPDATE MODAL :::::::::::::::::::::::::: */}
                  <Modal id="showModal" isOpen={modal} toggle={toggle} centered>
                    <ModalHeader className="bg-info-subtle p-3" toggle={toggle}>
                      {!!isEdit
                        ? "Modifier la  matière première"
                        : "Ajouter une matière première"}
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
                                htmlFor="date-field"
                                className="form-label"
                              >
                                Date
                              </Label>
                              <div className="form-control">
                                {moment().format("YYYY-MM-DD")}
                              </div>
                            </div>
                          </Col>
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
                                placeholder="Nom..."
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
                                htmlFor="quantity-field"
                                className="form-label"
                              >
                                Quantité
                              </Label>
                              <Input
                                name="quantity"
                                id="quantity-field"
                                className="form-control"
                                placeholder="Quantité..."
                                type="text"
                                validate={{
                                  required: { value: true },
                                }}
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.quantity || ""}
                                invalid={
                                  validation.touched.quantity &&
                                  validation.errors.quantity
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.quantity &&
                              validation.errors.quantity ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.quantity}
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

            {/* :::::::::::::::::::::: VIEW MatierePremieres :::::::::::::::::::::::::: */}
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
                <div id="contact-view-detail">
                  <div className=" mb-5">
                    <h5 className="mt-4 mb-3">{info.name}</h5>
                  </div>
                  <div>
                    <div className="table-responsive table-card">
                      <Table className="table table-borderless mb-0">
                        <tbody>
                          <tr>
                            <td className="fw-medium">Quantité</td>
                            <td>{info.quantity}</td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Observation</td>
                            <td>
                              {info.observation || "tonyanoble@velzon.com"}
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
