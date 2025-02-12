import React, { useState, useEffect } from "react";
import {
  Col,
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  ModalFooter,
  FormFeedback,
  Button,
  Label,
  Input,
} from "reactstrap";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import { useFormik } from "formik";
import axiosWithToken from "../ApiCalls/axiosWithToken";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./Articles.css"; // Import custom CSS

export default function Articles() {
  document.title = "Articles";

  const [modal, setModal] = useState(false);
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);

  const toggleModal = () => {
    setModal(!modal);
  };
  const handleCreate = () => {
    setCurrentArticle(null);
    formik.resetForm();
    toggleModal();
  };
  const fetchArticles = async () => {
    try {
      const response = await axiosWithToken.get("/admin/articles");
      setArticles(response.data);
    } catch (error) {
      toast.error("Failed to fetch articles");
    }
  };

  const handleEdit = (article) => {
    setCurrentArticle(article);
    formik.setValues(article);
    toggleModal();
  };

  const handleDelete = async (id) => {
    try {
      await axiosWithToken.delete(`/admin/delete-article/${id}`);
      toast.success("Article deleted successfully");
      fetchArticles();
    } catch (error) {
      toast.error("Failed to delete article");
    }
  };

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    content: Yup.string().required("Content is required"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (currentArticle) {
          await axiosWithToken.put(`/admin/update-article/${currentArticle.id}`, values);
          toast.success("Article updated successfully");
        } else {
          await axiosWithToken.post("/admin/create-article", values);
          toast.success("Article created successfully");
        }
        toggleModal();
        fetchArticles();
      } catch (error) {
        toast.error("Failed to save article");
      }
    },
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div style={{ width: '100px', height: '50px', }}></div>
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <Button color="primary" onClick={handleCreate}>
                    Create Article
                  </Button>
                </CardHeader>
                <CardBody>
                  <Row>
                    {articles.map((article) => (
                      <Col md="3" key={article.id}>
                        <Card className="article-card" onClick={() => handleEdit(article)}>
                          <CardBody>
                            <h5>{article.title}</h5>
                            <p>{article.content.substring(0, 100)}...</p>
                            <p className="text-muted">{new Date(article.createdAt).toLocaleDateString()}</p>
                            <div className="icon-container">
                              <FaEdit className="icon edit" onClick={(e) => { e.stopPropagation(); handleEdit(article); }} />
                              <FaTrash className="icon delete" onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }} />
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>{currentArticle ? "Edit Article" : "Create Article"}</ModalHeader>
        <ModalBody>
          <Form onSubmit={(e) => {
            e.preventDefault();
            formik.handleSubmit();
            return false;
          }}>
            <Row>
              <Col md="12">
                <Label for="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.title && formik.errors.title
                      ? "is-invalid"
                      : ""
                  }
                />
                {formik.touched.title && formik.errors.title ? (
                  <FormFeedback>{formik.errors.title}</FormFeedback>
                ) : null}
              </Col>
              <Col md="12">
                <Label for="content">Content</Label>
                <Input
                  id="content"
                  name="content"
                  type="textarea"
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.content && formik.errors.content
                      ? "is-invalid"
                      : ""
                  }
                />
                {formik.touched.content && formik.errors.content ? (
                  <FormFeedback>{formik.errors.content}</FormFeedback>
                ) : null}
              </Col>
            </Row>
            <ModalFooter>
              <Button type="submit" color="primary">
                Submit
              </Button>
              <Button type="button" color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </Modal>

      <ToastContainer />
    </React.Fragment>
  );
}