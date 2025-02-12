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
import logoLight from "../../assets/images/logo-dark.png";
import { useSelector } from "react-redux";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { login } from "../ApiCalls/LoginAPI";
import './stylo.scss';
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();
  const { errorMsg, loading } = useSelector((state) => state.Login);
  const [passwordShow, setPasswordShow] = useState(false);
  const [error, setError] = useState(""); // Add error state

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email required"),
      password: Yup.string().required("Password required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values, "student");
        navigate("/student-page");
      } catch (error) {
        console.error("Login failed:", error);
        setError("Login failed. Please try again.");
        setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAgencyLogin = async () => {
    try {
      await login(formik.values, "agency");
      const agencyId = Cookies.get("agencyId");
      navigate(`/agencyPage/${agencyId}`);
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please try again.");
      setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
    }
  };

  return (
    <ParticlesAuth>
      <div className="auth-page-content">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <Link to="/landingPage" className="d-inline-block auth-logo">
                  <img src={logoLight} alt="Logo" height="100" />
                </Link>
              </div>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="mt-4">
                <CardBody className="p-4">
                  <div className="text-center pt pb">
                    <h5 className="text-custom-color">Bienvenue à nouveau !</h5>
                  </div>
                  {errorMsg && <Alert color="danger">{errorMsg}</Alert>}
                  <Form onSubmit={formik.handleSubmit}>
                    <div className="mb-3">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        invalid={formik.touched.email && !!formik.errors.email}
                      />
                      <FormFeedback>{formik.errors.email}</FormFeedback>
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
                          invalid={formik.touched.password && !!formik.errors.password}
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordShow(!passwordShow)}
                          className="password-toggle-btn"
                        >
                          <i className="ri-eye-fill align-middle"></i>
                        </button>
                        <FormFeedback>{formik.errors.password}</FormFeedback>
                      </div>
                    </div>
                    <div className="mt-4 d-flex justify-content-between">
                      <Button
                        disabled={loading}
                        color="primary"
                        className="btn btn-primary w-45"
                        type="submit"
                      >
                        {loading ? (
                          <Spinner size="sm" className="me-2">
                            {" "}
                            Loading...{" "}
                          </Spinner>
                        ) : (
                          "Connexion Étudiant"
                        )}
                      </Button>
                      <Button
                        disabled={loading}
                        color="success"
                        className="btn btn-success w-45"
                        type="button"
                        onClick={handleAgencyLogin}
                      >
                        {loading ? (
                          <Spinner size="sm" className="me-2">
                            {" "}
                            Loading...{" "}
                          </Spinner>
                        ) : (
                          "Connexion Agence"
                        )}
                      </Button>
                    </div>
                  </Form>
                  {error && (
                    <div className="text-center mt-3">
                      <Alert color="danger">{error}</Alert>
                    </div>
                  )}
                  <div className="text-center mt-4">
                    <p>
                      Don't have an account?{" "}
                      <Button color="link" onClick={() => navigate("/registerAgency")} className="button-custom-color">
                        Register
                      </Button>
                    </p>
                  </div>
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

export default Login;