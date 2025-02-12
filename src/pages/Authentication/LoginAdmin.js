import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
  Alert,
  Spinner,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import logoLight from "../../assets/images/logo-light.png";
import { useSelector } from "react-redux";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { login } from "../ApiCalls/LoginAPI";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const { errorMsg, loading } = useSelector((state) => state.Login);
  const [passwordShow, setPasswordShow] = useState(false);
  const [error, setError] = useState(""); // Add error state

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: Yup.object({
      username: Yup.string().required("Name required"),
      password: Yup.string().required("Password required"),
    }),
    onSubmit: async (values) => {
      try {
        await login(values,"admin");
        navigate("/dashboard");
      } catch (error) {
        console.error("Login failed:", error);
        setError("Login failed. Please try again.");
        setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
      }
    },
  });

  return (
    <ParticlesAuth>
      <div className="auth-page-content">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <Link to="/" className="d-inline-block auth-logo">
                  <img src={logoLight} alt="Logo" height="100" />
                </Link>
              </div>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="mt-4">
                <CardBody className="p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">Se connecter</h5>
                  </div>
                  {errorMsg && <Alert color="danger">{errorMsg}</Alert>}
                  <Form onSubmit={formik.handleSubmit}>
                    <div className="mb-3">
                      <Label htmlFor="username">UserName</Label>
                      <Input
                        id="username"
                        name="username"
                        type="username"
                        placeholder="username"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}
                        invalid={formik.touched.username && !!formik.errors.username}
                      />
                      <FormFeedback>{formik.errors.username}</FormFeedback>
                    </div>
                    <div className="mb-3">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="position-relative mb-3">
                        <Input
                          id="password"
                          name="password"
                          type={passwordShow ? "text" : "password"}
                          placeholder="Mot de passe"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.password}
                          invalid={
                            formik.touched.password && !!formik.errors.password
                          }
                        />
                        <button
                          className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
                          type="button"
                          onClick={() => setPasswordShow(!passwordShow)}
                        >
                          <i className="ri-eye-fill align-middle"></i>
                        </button>
                        <FormFeedback>{formik.errors.password}</FormFeedback>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        disabled={loading}
                        color="success"
                        className="btn btn-success w-100"
                        type="submit"
                      >
                        {loading ? (
                          <Spinner size="sm" className="me-2">
                            {" "}
                            Loading...{" "}
                          </Spinner>
                        ) : (
                          "Connexion"
                        )}
                      </Button>
                    </div>
                  </Form>
                  {error && (
                    <div className="text-center mt-3">
                      <Alert color="danger">{error}</Alert>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      {error && (
        <div className="fixed-bottom mb-3">
          <Container>
            <Alert color="danger" className="text-center">
              {error}
            </Alert>
          </Container>
        </div>
      )}
    </ParticlesAuth>
  );
};

export default LoginAdmin;