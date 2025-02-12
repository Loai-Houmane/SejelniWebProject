import React, { useCallback, useEffect, useState } from "react";
import {
  Col,
  Container,
  Row,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import TableContainer from "../../Components/Common/TableContainer";
import Loader from "../../Components/Common/Loader";
import ExportCSVModal from "../../Components/Common/ExportCSVModal";
import axiosWithToken from "../ApiCalls/axiosWithToken";

export default function MouvementStocks() {
  document.title = "Mouvement du stock";

  // State management
  const [info, setInfo] = useState([]);
  const [isExportCSV, setIsExportCSV] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mouvementStocks, setMouvementStock] = useState([]);

  // GET ALL MOUVEMENTS 
  const getAllMouvementStocks = async () => {
    try {
      const response = await axiosWithToken.get("/movements");
      if (response.data != null) {
        return response.data;
      } else {
        // console.log("No mouvementStocks found");
        return [];
      }
    } catch (error) {
      console.error("Error getting mouvementStocks:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchCollaborator = async (collaboratorId) => {
      try {
        const response = await axiosWithToken.get(
          `/collaborators/${collaboratorId}`
        );
        return response.data.name;
      } catch (error) {
        console.error("Failed to fetch collaborator:", error);
        return null;
      }
    };

    const fetchProduct = async (productId, productType) => {
      const apiEndpoint =
        productType === "raw_material"
          ? `/matiere-premiere/${productId}`
          : `/produit-fini/${productId}`;

      try {
        const response = await axiosWithToken.get(apiEndpoint);
        return response.data.name;
      } catch (error) {
        console.error(
          `Failed to fetch product details for ${productType} with ID ${productId}:`,
          error
        );
        return null;
      }
    };

    const fetchData = async () => {
      try {
        const mouvementStocksData = await getAllMouvementStocks();
        const updatedMouvementStocksData = await Promise.all(
          mouvementStocksData.map(async (mouvement) => {
            const collaboratorName = await fetchCollaborator(
              mouvement.collaborator_id
            );
            const productName = await fetchProduct(
              mouvement.product_id,
              mouvement.product_type
            );

            // Replace product_type and movement_type values as per your requirement
            const productTypeTranslation =
              mouvement.product_type === "raw_material"
                ? "Matière première"
                : mouvement.product_type === "final_product"
                ? "Produit fini"
                : mouvement.product_type;

            const movementTypeTranslation =
              mouvement.movement_type === "add"
                ? "Entrée"
                : mouvement.movement_type === "use"
                ? "Sortie"
                : mouvement.movement_type;

            return {
              ...mouvement,
              collaborator_name: collaboratorName || mouvement.collaborator_id,
              product_name: productName || mouvement.product_id,
              product_type: productTypeTranslation,
              movement_type: movementTypeTranslation,
            };
          })
        );

        setMouvementStock(updatedMouvementStocksData);
        if (!info.id && updatedMouvementStocksData.length > 0) {
          setInfo(updatedMouvementStocksData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch mouvementStocks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleViewModal = useCallback(() => {
    setViewModal(!viewModal);
  }, [viewModal]);

  // Exporter
  const headers = [
    { id: "createdAt", displayName: "Date" },
    { id: "collaborator_name", displayName: "Collaborateur" },
    { id: "product_name", displayName: "Produit" },
    { id: "product_type", displayName: "Type du produit" },
    { id: "movement_type", displayName: "Action" },
    { id: "quantity", displayName: "Quantité" },
    { id: "observation", displayName: "Observation" },
  ];

  const columns = [
    {
      header: "Date",
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
      header: "Collaborateurs",
      accessorKey: "collaborator_name",
      enableColumnFilter: false,
    },
    {
      header: "Produits",
      accessorKey: "product_name",
      enableColumnFilter: false,
    },
    {
      header: "Type de produit",
      accessorKey: "product_type",
      enableColumnFilter: false,
    },
    {
      header: "Action",
      accessorKey: "movement_type",
      enableColumnFilter: false,
    },
    {
      header: "Quantité",
      accessorKey: "quantity",
      enableColumnFilter: false,
    },

    {
      header: "Voir",
      cell: (cellProps) => (
        <ul className="list-inline hstack gap-2 mb-0">
          <li className="list-inline-item edit" title="Call">
            <div
              className="dropdown-item"
              href="#"
              onClick={() => {
                const finalProductsData = cellProps.row.original;
                setInfo(finalProductsData);
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
          data={mouvementStocks.map((mouvementStock) => ({
            createdAt: String(mouvementStock.createdAt),
            collaborator_name: String(mouvementStock.collaborator_name),
            product_name: String(mouvementStock.product_name),
            product_type: String(mouvementStock.product_type),
            movement_type: String(mouvementStock.movement_type),
            quantity: String(mouvementStock.quantity),
            observation: String(mouvementStock.observation),
          }))}
          headers={headers}
          filename={"mouvement_du_stock"}
        />
        <Container fluid>
          <BreadCrumb title="Mouvement du stock" pageTitle="CRM" />
          <Row>
            <Col xxl={12}>
              <Card>
                <CardBody className="pt-0">
                  {isLoading ? (
                    <Loader />
                  ) : (
                    <div>
                      <TableContainer
                        columns={columns}
                        data={mouvementStocks || []}
                        isGlobalFilter={true}
                        isAddUserList={false}
                        customPageSize={8}
                        className="custom-header-css"
                        divClass="table-responsive table-card mb-3"
                        tableClass="align-middle table-nowrap"
                        theadClass="table-light"
                        SearchPlaceholder="Rechercher..."
                      />
                      <div className="d-flex align-items-center flex-wrap gap-2 pt-3">
                        <div className="flex-shrink-0 ms-auto">
                          <div className="hstack text-nowrap gap-2">
                            <button
                              className="btn btn-soft-success"
                              onClick={() => setIsExportCSV(true)}
                            >
                              Export
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* :::::::::::::::::::::: VIEW MouvementStock :::::::::::::::::::::::::: */}
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
                  <div className=" mb-5">
                    <h5 className="mt-4 mb-1">{info.product_name}</h5>
                    <p className="text-muted">
                      {info.createdAt ? info.createdAt.split("T")[0] : ""}
                    </p>
                  </div>
                  <div>
                    <div className="table-responsive table-card">
                      <Table className="table table-borderless mb-0">
                        <tbody>
                          <tr>
                            <td className="fw-medium">Collaborateur</td>
                            <td>{info.collaborator_name}</td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Produit</td>
                            <td>{info.product_name}</td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Type</td>
                            <td>{info.product_type}</td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Action</td>
                            <td>{info.movement_type}</td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Quantité</td>
                            <td>{info.quantity}</td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Observation</td>
                            <td>{info.observation}</td>
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
