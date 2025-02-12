import React, { useEffect, useState, useCallback } from "react";
import moment from "moment";
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
import Select from "react-select";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import Loader from "../../Components/Common/Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExportCSVModal from "../../Components/Common/ExportCSVModal";
import * as Yup from "yup";
import { useFormik } from "formik";
import axiosWithToken from "../ApiCalls/axiosWithToken";
import * as CommandeAPI from "../ApiCalls/CommandeAPI";
import Cookies from "js-cookie";

export default function Commandes() {
  document.title = "Commandes";

  const statuses = [
    { label: "En attente", value: "pending" },
    { label: "Terminé", value: "completed" },
    { label: "Annulé", value: "canceled" },
  ];

  const urgencyLevel = [
    { label: "Faible  ", value: "low" },
    { label: "Moyen", value: "medium" },
    { label: "Élevé", value: "high" },
  ];

  const roles = Cookies.get("roles");

  //Status TRONSFORMATION BETWEEN BACK & FRON
  const transformStatus = (status) => {
    return { label: status, value: status };
  };

  // State management
  const [isEdit, setIsEdit] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [info, setInfo] = useState([]);
  const [modal, setModal] = useState(false);
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [clientList, setClientList] = useState([]);
  const [clients, setClients] = useState([]);

  const [commandesList, setCommandesList] = useState([]);
  const [selectedCommande, setSelectedCommande] = useState([]);
  const [commandeAdded, setCommandeAdded] = useState(false);

  const [produitsFinisList, setProduitsFinisList] = useState([]);
  const [selectedProduitFinis, setSelectedProduitFinis] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});

  // Produit Finis
  const getAllProduitFinis = async () => {
    try {
      const response = await axiosWithToken.get("/produit-fini");
      const produistFinis = response.data.map((pf) => ({
        value: pf.id,
        id: pf.id,
        label: pf.name,
        quantity: pf.quantity,
      }));
      setProduitsFinisList(produistFinis);
    } catch (error) {
      console.error("Error getting produit fini:", error);
      throw error;
    }
  };

  // Clients
  const getAllClients = async () => {
    try {
      const { data } = await axiosWithToken.get("/clients");
      return data || [];
    } catch (error) {
      console.error("Error getting clients:", error);
      throw error;
    }
  };

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

  // Commandes
  const getAllCommandes = async () => {
    try {
      const { data } = await axiosWithToken.get("/orders");
      return data || [];
    } catch (error) {
      console.error("Error getting commandes:", error);
      throw error;
    }
  };

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

  const getOrderByCollaborator = async () => {
    const token = Cookies.get("accessToken");
    try {
      const response = await axiosWithToken.post(`/orders/collaborator`, {
        collaborator_id: token,
      });
      if (response.data != null) {
        // console.log("commands in getOrderByCollaborator:", response.data);
        return response.data;
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
      setIsLoading(true);
  
      let clientsData = [];
      let commandesData = [];
  
      // Fetch clients and commandes based on roles
      if (roles?.includes("Commercial")) {
        [clientsData, commandesData] = await Promise.all([
          getClientByCollaborator(),
          getOrderByCollaborator(),
        ]);
      } else if (roles?.includes("Administrateur" )|| roles?.includes("Magasinier") ){
        [clientsData, commandesData] = await Promise.all([
          getAllClients(),
          getAllCommandes(),
        ]);
      }
  
      // Fetch collaborators and finished products in parallel
      const [collaborators] = await Promise.all([
        getAllCollaborators(),
        getAllProduitFinis(),
      ]);
  
      // Create lookup maps for clients and collaborators
      const clientMap = new Map(clientsData.map((client) => [client.id, client.name]));
      const collaboratorMap = new Map(collaborators.map((collaborator) => [collaborator.id, collaborator.name]));
  
      // Update commandes with client and collaborator names
      const updatedCommandesList = commandesData.map((commande) => ({
        ...commande,
        client_name: clientMap.get(commande.client_id) || "Unknown Client",
        collaborator_name: collaboratorMap.get(commande.collaborator_id) || "Unknown Collaborator",
      }));
  
      // Batch state updates to avoid unnecessary re-renders
      setClients(clientsData);
      setCollaborators(collaborators);
      setCommandesList(updatedCommandesList);
      setClientList(clientsData.map((client) => ({ label: client.name, value: client.id })));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
//!data fetching
  useEffect(() => {
    fetchData();
  }, []);

  // HANDLERS
  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setIsEdit(false);
      setSelectedCommande(null);
    } else {
      setModal(true);
      setSelectedProduitFinis([]);
    }
  }, [modal]);

  const toggleViewModal = useCallback(() => {
    setViewModal(!viewModal);
  }, [viewModal]);

  const handleCommandeClicks = () => {
    setSelectedCommande("");
    setIsEdit(false);
    toggle();
  };

  // CREATE
  const addCommande = async (newCommande) => {
    try {
      await CommandeAPI.addCommandeRequest(newCommande);
      setCommandeAdded(true);
      toast.success("Commande ajoutée avec succés");
    } catch (error) {
      toast.error("Echec de l'ajout de la commande");
      console.error("Error adding Commande:", error);
    }
  };

  useEffect(() => {
    if (commandeAdded) {
      setCommandeAdded(false);
      fetchData();
    }
  }, [commandeAdded]);

  // UPDATE
  const handleCommandeClick = (commande) => {
    setSelectedCommande(commande);
    setSelectedProduitFinis(commande.produits || []);
    setIsEdit(true);
    toggle();
  };

  const getUpdatedValues = () => {
    const final_products = (selectedProduitFinis || []).map((product) => ({
      product_id: product.id,
      quantity: productQuantities[product.value] || "",
    }));
    return {
      client_id: formik.values.client_id?.value,
      delivery_date: formik.values.delivery_date,
      status: formik.values.status?.value,
      collaborator_id: Cookies.get("accessToken"),
      urgency_level: formik.values.urgency_level?.value,
      observation: formik.values.observation,
      final_products,
    };
  };

  const handleUpdateCommande = async () => {
    const updateCommande = getUpdatedValues();
    const id = selectedCommande.id;

    try {
      const response = await CommandeAPI.updateCommandeRequest(
        id,
        updateCommande
      );
      const updatedCommande = {
        ...response,
        id,
        statuses: response.status ? [transformStatus(response.status)] : [],
      };

      setCommandesList((prevList) =>
        prevList.map((cmd) => (cmd.id === id ? updatedCommande : cmd))
      );

      setCommandeAdded(true);
      toggle();
      toast.success("Commande mise à jour avec succés.");
    } catch (error) {
      console.error("Update failed: ", error);
      toast.error("Echec de la mise à jour de la commande.");
    }
  };

  const handleProduitFiniChange = (selectedOptions) => {
    setSelectedProduitFinis(selectedOptions || []);
    const newQuantities = {};
    selectedOptions.forEach((option) => {
      newQuantities[option.value] = productQuantities[option.value] || "";
    });
    setProductQuantities(newQuantities);
  };

  const handleProduitFiniQuantityChange = (productId, quantity) => {
    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));
  };

  const validationSchema = Yup.object().shape({
    client_id: Yup.object().required("Client is required"),
    delivery_date: Yup.date()
      .min(new Date(), "La date de livraison ne peut pas être dans le passé")
      .required("Date de livraison est requise")
      .nullable(),
    status: Yup.object().required("Le statut est obligatoire"),
    urgency_level: Yup.object().required("Niveau d'urgence est requis"),
    produits: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.object().required("Produit est requis"),
          quantity: Yup.number()
            .required("La quantité est obligatoire")
            .min(1, "La quantité minimale est 1"),
        })
      )
      .required("Au moins un produit est requis"),
  });

  const formik = useFormik({
    initialValues: {
      client_id: null,
      createdAt: "",
      delivery_date: "",
      urgency_level: null,
      status: null,
      observation: null,
      produits: [],
    },
    validationSchema,
    onSubmit: (values) => {
      const final_products = selectedProduitFinis.map((product) => ({
        product_id: product.value,
        quantity: productQuantities[product.value] || "",
      }));

      const newCommande = {
        client_id: values.client_id.value,
        collaborator_id: Cookies.get("accessToken"),
        delivery_date: values.delivery_date,
        status: values.status.value,
        observation: values.observation,
        urgency_level: values.urgency_level.value,
        final_products,
      };

      if (isEdit) {
        handleUpdateCommande();
      } else {
        addCommande(newCommande);
      }
    },
  });

  useEffect(() => {
    if (isEdit && selectedCommande) {
      const produitsIds = (selectedCommande.products || []).map((p) => ({
        value: p.product_name,
        id: p.product_id,
        label:
          produitsFinisList.find((prod) => prod.value === p.id)?.label ||
          `${p.product_name}`,
      }));

      const quantities = {};
      (selectedCommande.products || []).forEach((p) => {
        quantities[p.product_name] = p.ordered_quantity;
      });

      formik.setValues({
        client_id:
          clientList.find(
            (client) => client.value === selectedCommande.client_id
          ) || null,
        createdAt: selectedCommande.createdAt,
        delivery_date: moment
          .utc(selectedCommande.delivery_date)
          .format("YYYY-MM-DD"),
        status:
          statuses.find((status) => status.value === selectedCommande.status) ||
          null,
        urgency_level:
          urgencyLevel.find(
            (urgency) => urgency.value === selectedCommande.urgency_level
          ) || null,
        observation: selectedCommande.observation,

        produits: produitsIds,
        quantity: quantities,
      });

      setSelectedProduitFinis(produitsIds);
      setProductQuantities(quantities);
    }
  }, [isEdit, selectedCommande]);

  const columns = [
    {
      header: "Client",
      accessorKey: "client_name",
      enableColumnFilter: false,
    },
    {
      header: "Date de commande",
      accessorKey: "createdAt",
      enableColumnFilter: false,
      cell: (cell) => {
        const dateValue = cell.getValue();
        const validDate = dateValue ? new Date(dateValue) : null;

        return (
          <div className="d-flex align-items-center">
            {validDate && !isNaN(validDate)
              ? validDate.toISOString().split("T")[0]
              : "Invalid Date"}
          </div>
        );
      },
    },
    {
      header: "Date Livraison",
      accessorKey: "delivery_date",
      enableColumnFilter: false,
      cell: (cell) => {
        const dateValue = cell.getValue();
        const validDate = dateValue ? new Date(dateValue) : null;

        return (
          <div className="d-flex align-items-center">
            {validDate && !isNaN(validDate)
              ? validDate.toISOString().split("T")[0]
              : "Invalid Date"}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const statusValue = getValue();
        const statusLabel =
          statuses.find((status) => status.value === statusValue)?.label ||
          "Same Status";
        return <span>{statusLabel}</span>;
      },
    },
    {
      header: "Niveau d'urgence",
      accessorKey: "urgency_level",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const urgencylevel = getValue();
        const urgencyLabel =
          urgencyLevel.find((ul) => ul.value === urgencylevel)?.label ||
          "Unknown";
        return <span>{urgencyLabel}</span>;
      },
    },
    {
      header: "Action",
      cell: (cellProps) => {
        return (
          <ul className="list-inline hstack gap-2 mb-0">
            {/* VIEW */}
            <li className="list-inline-item edit" title="View">
              <div
                className="dropdown-item"
                href="#"
                onClick={() => {
                  const commandData = cellProps.row.original;
                  setInfo(commandData);
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

            {/* UPDATE */}
            {/* Only show the Edit option if the user is not a "Magasinier" */}
            {!roles.includes("Magasinier") && (
              <li className="list-inline-item edit" title="Edit">
                <div
                  className="dropdown-item edit-item-btn"
                  href="#"
                  onClick={() => handleCommandeClick(cellProps.row.original)}
                >
                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>
                </div>
              </li>
            )}

            <li className="list-inline-item"></li>
          </ul>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <ExportCSVModal
          show={isExportCSV}
          onCloseClick={() => setIsExportCSV(false)}
          data={commandesList.flatMap((Commande) =>
            (Commande.products || []).map((product) => ({
              id: Commande.id,
              collaborator_name: String(Commande.collaborator_name || ""),
              client_name: String(Commande.client_name || ""),
              createdAt: moment(Commande.createdAt).format("DD MMM YYYY"),
              delivery_date: moment(Commande.delivery_date).format(
                "DD MMM YYYY"
              ),
              status: String(Commande.status),
              urgency_level: String(Commande.urgency_level),
              product_name: product.product_name,
              ordered_quantity: product.ordered_quantity,
            }))
          )}
          headers={[
            { id: "id", displayName: "ID" },
            { id: "client_name", displayName: "Client" },
            { id: "collaborator_name", displayName: "Commerciale" },
            { id: "createdAt", displayName: "Date de commande" },
            { id: "delivery_date", displayName: "Date de livraison" },
            { id: "status", displayName: "Status" },
            { id: "urgency_level", displayName: "Niveau d'urgence" },
            { id: "product_name", displayName: "Nom du produit" },
            { id: "ordered_quantity", displayName: "Quantité commandée" },
          ]}
          filename={"Commandes"}
        />

        <Container fluid>
          <BreadCrumb title="commandes" pageTitle="CRM" />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    {/* Only show the Edit option if the user is not a "Magasinier" */}
                    {!roles.includes("Magasinier") && (
                      <div className="flex-grow-1">
                        <button
                          className="btn btn-info add-btn"
                          onClick={() => {
                            if (!isEdit) {
                              formik.resetForm();
                            }
                            setSelectedProduitFinis([]);
                            setProductQuantities({});
                            setModal(true);
                          }}
                        >
                          <i className="ri-add-fill me-1 align-bottom"></i>
                          Ajouter une commande
                        </button>
                      </div>
                    )}
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
                  {/* :::::::::::::::::::::: LIST ORDERS :::::::::::::::::::::::::: */}
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <TableContainer
                      columns={columns}
                      data={commandesList || []}
                      isGlobalFilter={true}
                      isAddUserList={false}
                      customPageSize={8}
                      className="custom-header-css"
                      divClass="table-responsive table-card mb-3"
                      tableClass="align-middle table-nowrap"
                      theadClass="table-light"
                      handleCommandeClick={handleCommandeClicks}
                      isCommandesFilter={true}
                      SearchPlaceholder="Rechercher une commande..."
                    />
                  )}
                  {/* :::::::::::::::::::::: ADD / UPDATE MODAL :::::::::::::::::::::::::: */}
                  <Modal isOpen={modal} toggle={toggle}>
                    <ModalHeader toggle={toggle} className="bg-info-subtle p-3">
                      {isEdit ? "Ajouter une commande" : "Modifier la commande"}
                    </ModalHeader>
                    <ModalBody>
                      <Form>
                        <Row>
                          <Col md="12">
                            <Label for="client_id">Client</Label>
                            <Select
                              id="client_id"
                              name="client_id"
                              options={clientList}
                              value={formik.values.client_id}
                              onChange={(option) =>
                                formik.setFieldValue("client_id", option)
                              }
                              onBlur={formik.handleBlur}
                              className={
                                formik.touched.client_id &&
                                formik.errors.client_id
                                  ? "is-invalid"
                                  : ""
                              }
                            />
                            {formik.touched.client_id &&
                            formik.errors.client_id ? (
                              <FormFeedback>
                                {formik.errors.client_id.label}
                              </FormFeedback>
                            ) : null}
                          </Col>
                          <Col lg={12}>
                            <div>
                              <Label
                                htmlFor="date-field"
                                className="form-label pt-2"
                              >
                                Date
                              </Label>
                              <div className="form-control">
                                {isEdit
                                  ? moment
                                      .utc(formik.values.createdAt)
                                      .format("DD-MM-YYYY")
                                  : moment().format("DD-MM-YYYY")}
                              </div>
                            </div>
                          </Col>
                          <Col md="12">
                            <Label
                              for="delivery_date"
                              className="form-label pt-2"
                            >
                              Date de livraison
                            </Label>
                            <Input
                              type="date"
                              id="delivery_date"
                              name="delivery_date"
                              value={formik.values.delivery_date}
                              onChange={formik.handleChange}
                              onBlur={(e) => {
                                formik.handleBlur(e);
                                if (moment(e.target.value).isBefore(moment())) {
                                  formik.setFieldValue(
                                    "delivery_date",
                                    moment().format("DD-MM-YYYY")
                                  );
                                }
                              }}
                              invalid={
                                formik.touched.delivery_date &&
                                formik.errors.delivery_date
                              }
                            />
                            {formik.touched.delivery_date &&
                            formik.errors.delivery_date ? (
                              <FormFeedback>
                                {formik.errors.delivery_date}
                              </FormFeedback>
                            ) : null}
                          </Col>
                          <Col md="12">
                            <Label for="status" className="form-label pt-2">
                              Status
                            </Label>
                            <Select
                              id="statues"
                              name="status"
                              options={statuses}
                              value={formik.values.status}
                              onChange={(option) =>
                                formik.setFieldValue("status", option)
                              }
                              onBlur={formik.handleBlur}
                              className={
                                formik.touched.status && formik.errors.status
                                  ? "is-invalid"
                                  : ""
                              }
                            />
                            {formik.touched.status && formik.errors.status ? (
                              <FormFeedback>
                                {formik.errors.status.label}
                              </FormFeedback>
                            ) : null}
                          </Col>
                          <Col md="12">
                            <Label
                              for="urgency_level"
                              className="form-label pt-2"
                            >
                              Niveau d'urgence
                            </Label>
                            <Select
                              id="urgency_level"
                              name="urgency_level"
                              options={urgencyLevel}
                              value={formik.values.urgency_level}
                              onChange={(option) =>
                                formik.setFieldValue("urgency_level", option)
                              }
                              onBlur={formik.handleBlur}
                              className={
                                formik.touched.urgency_level &&
                                formik.errors.urgency_level
                                  ? "is-invalid"
                                  : ""
                              }
                            />
                            {formik.touched.urgency_level &&
                            formik.errors.urgency_level ? (
                              <FormFeedback>
                                {formik.errors.urgency_level.label}
                              </FormFeedback>
                            ) : null}
                          </Col>
                          <Col lg={12}>
                            <div>
                              <Label
                                htmlFor="produit-fini-field"
                                className="form-label pt-2"
                              >
                                Produit Fini
                              </Label>
                              <Select
                                id="produit-fini-field"
                                isMulti
                                options={produitsFinisList}
                                onChange={(selectedOptions) => {
                                  handleProduitFiniChange(selectedOptions);
                                  const newQuantities = {};
                                  selectedOptions.forEach((option) => {
                                    newQuantities[option.value] =
                                      productQuantities[option.value] || "";
                                  });
                                  setProductQuantities(newQuantities);
                                }}
                                value={selectedProduitFinis}
                                placeholder="Select Produit Fini"
                                classNamePrefix="select"
                              />
                            </div>
                          </Col>
                          <Col lg={12}>
                            {selectedProduitFinis.map((product) => (
                              <div key={product.value}>
                                <Label
                                  htmlFor={`quantity-${product.value}`}
                                  className="form-label pt-2"
                                >
                                  Quantité de {product.label}
                                </Label>
                                <Input
                                  id={`quantity-${product.value}`}
                                  type="number"
                                  min="0"
                                  placeholder={`Enter Quantity for ${product.label}`}
                                  value={productQuantities[product.value] || ""}
                                  onChange={(e) =>
                                    handleProduitFiniQuantityChange(
                                      product.value,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </Col>
                        </Row>
                        <Col lg={12}>
                          <div className="pt-2">
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
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.observation || ""}
                              invalid={
                                formik.touched.observation &&
                                formik.errors.observation
                                  ? true
                                  : false
                              }
                            />
                            {formik.touched.observation &&
                            formik.errors.observation ? (
                              <FormFeedback type="invalid">
                                {formik.errors.observation}
                              </FormFeedback>
                            ) : null}
                          </div>
                        </Col>
                        <Row className="mt-4">
                          <Col md="12" className="text-right">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              onClick={(event) => {
                                event.preventDefault();
                                if (isEdit) {
                                  handleUpdateCommande();
                                  setModal(false);
                                } else {
                                  formik.handleSubmit();
                                  setModal(false);
                                }
                              }}
                            >
                              {isEdit ? "Modifier" : "Ajouter"}
                            </button>
                          </Col>
                        </Row>
                      </Form>
                    </ModalBody>
                  </Modal>
                  <ToastContainer closeButton={false} limit={1} />
                </CardBody>
              </Card>
            </Col>

            {/* :::::::::::::::::::::: VIEW Commande :::::::::::::::::::::::::: */}
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
                    <h5 className="mt-4 mb-1">{info.client_name}</h5>
                    <p className="text-muted">Id commande : {info.id}</p>
                  </div>
                  <div className="table-responsive table-card">
                    <Table className="table table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="fw-medium">Commerciale</td>
                          <td>{info.collaborator_name}</td>
                        </tr>
                        <tr>
                          <td className="fw-medium">Date de commande</td>
                          <td>
                            {info.createdAt ? info.createdAt.split("T")[0] : ""}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-medium">Date de livraison</td>
                          <td>
                            {info.delivery_date
                              ? info.delivery_date.split("T")[0]
                              : ""}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-medium">Status</td>
                          <td>
                            {statuses.find(
                              (status) => status.value === info.status
                            )?.label || "Unknown"}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-medium">Niveau d'urgence </td>
                          <td>
                            {urgencyLevel.find(
                              (urgency_level) =>
                                urgency_level.value === info.urgency_level
                            )?.label || "Unknown"}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-medium">Observation</td>
                          <td>{info.observation || "Aucune observation"}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                  <div className="mb-4">
                    <h5 className="mt-4 mb-1">Produits</h5>
                  </div>

                  <div className="table-responsive table-card">
                    <Table className="table table-borderless mb-0">
                      <tbody>
                        {info.products?.map((product, index) => (
                          <tr key={index}>
                            <td className="fw-medium">
                              {product.product_name}
                            </td>
                            <td>{product.ordered_quantity}</td>
                          </tr>
                        )) || (
                          <tr>
                            <td>No products available</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
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
