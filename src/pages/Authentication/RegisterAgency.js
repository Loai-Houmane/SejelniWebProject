import React, { useEffect, useState } from "react";
import { Row, Col, CardBody, Card, Alert, Container, Input, Label, Form, FormFeedback, Button, Spinner } from "reactstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// action
import { registerUser, apiError, resetRegisterFlag } from "../../slices/thunks";
import { Signup } from "../ApiCalls/SignUpAPI";

//redux
import { useSelector, useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";

//import images 
import logoLight from "../../assets/images/logo-dark.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { createSelector } from "reselect";
// import './style.scss';

const RegisterAgency = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false); // Define state

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validation = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            email: '',
            password: '',
            confirm_password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Entrer Votre Email"),
            password: Yup.string().min(8, "Password must be at least 8 characters").required("Entrer Votre Mot De Pass"),
            confirm_password: Yup.string()
                .oneOf([Yup.ref('password'), null], "Mot De Passe Different")
                .required("Reecrire vote MDP!")
        }),
        onSubmit: async (values) => {
            const { confirm_password, ...signupValues } = values;
            try {
                const response = await Signup(signupValues, "agency");
                // Display a success message
                toast.success("Account Created!");
                // Wait for 1 second before navigating to the login page
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } catch (error) {
                // Display an error message
                toast.error("Account creation failed! ");
                console.error("Signup error:", error);
            }
        }
    });

    const handleStudentRegister = async () => {
        const { confirm_password, ...signupValues } = validation.values;
        try {
            const response = await Signup(signupValues, "student");
            // Display a success message
            toast.success("Account Created!");
            // Wait for 1 second before navigating to the login page
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            // Display an error message
            toast.error("Account creation failed! ");
            console.error("Signup error:", error);
        }
    };

    const selectLayoutState = (state) => state.Account;
    const registerdatatype = createSelector(
        selectLayoutState,
        (account) => ({
            success: account.success,
            error: account.error
        })
    );

    const { error, success } = useSelector(registerdatatype);

    useEffect(() => {
        dispatch(apiError(""));
    }, [dispatch]);

    document.title = "Creer un compte";

    return (
        <React.Fragment>
            <ParticlesAuth>
                <div className="auth-page-content">
                    <Container>
                        <Row>
                            <Col lg={12}>
                                <div className="text-center mt-sm-5 mb-4 text-white-50">
                                    <div>
                                        <Link to="/landingPage" className="d-inline-block auth-logo">
                                            <img src={logoLight} alt="" height="100" />
                                        </Link>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="mt-4">

                                    <CardBody className="p-4">
                                        <div className="text-center mt-2">
                                            <h5 className="text-custom-color">Creer un nouveau compte</h5>
                                        </div>
                                        <div className="p-2 mt-4">
                                            <Form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    validation.handleSubmit();
                                                    return false;
                                                }}
                                                className="needs-validation" action="#">

                                                {success && success ? (
                                                    <>
                                                        {toast("You are being redirected to the login page...", { position: "top-right", hideProgressBar: false, progress: undefined, toastId: "" })}
                                                        <ToastContainer autoClose={2000} limit={1} />
                                                        <Alert color="success">
                                                            Registered successfully! Redirecting to login page...
                                                        </Alert>
                                                    </>
                                                ) : null}

                                                {error && error ? (
                                                    <Alert color="danger"><div>{error.message || "An error occurred, please try again."}</div></Alert>
                                                ) : null}

                                                <div className="mb-3">
                                                    <Label htmlFor="useremail" className="form-label">Email <span className="text-danger">*</span></Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        className="form-control"
                                                        placeholder="Entrer Votre Email"
                                                        type="email"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.email || ""}
                                                        invalid={
                                                            validation.touched.email && validation.errors.email ? true : false
                                                        }
                                                    />
                                                    {validation.touched.email && validation.errors.email ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.email}</div></FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mb-3">
                                                    <Label htmlFor="userpassword" className="form-label">Mot De pass <span className="text-danger">*</span></Label>
                                                    <div className="input-group">
                                                        <Input
                                                            name="password"
                                                            type={showPassword ? "text" : "password"} // Toggle input type
                                                            placeholder="Entrer Mot de Passe"
                                                            onChange={validation.handleChange}
                                                            onBlur={validation.handleBlur}
                                                            value={validation.values.password || ""}
                                                            invalid={
                                                                validation.touched.password && validation.errors.password ? true : false
                                                            }
                                                        />
                                                        <div className="input-group-append">
                                                            <span className="input-group-text" onClick={togglePasswordVisibility} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {validation.touched.password && validation.errors.password ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.password}</div></FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mb-2">
                                                    <Label htmlFor="confirmPassword" className="form-label">Confirme Mot De passe <span className="text-danger">*</span></Label>
                                                    <Input
                                                        name="confirm_password"
                                                        type="password"
                                                        placeholder="Confirme Mot De Passe"
                                                        onChange={validation.handleChange}
                                                        onBlur={validation.handleBlur}
                                                        value={validation.values.confirm_password || ""}
                                                        invalid={
                                                            validation.touched.confirm_password && validation.errors.confirm_password ? true : false
                                                        }
                                                    />
                                                    {validation.touched.confirm_password && validation.errors.confirm_password ? (
                                                        <FormFeedback type="invalid"><div>{validation.errors.confirm_password}</div></FormFeedback>
                                                    ) : null}
                                                </div>

                                                <div className="mt-4">
                                                    <Button className="btn btn-success w-100 mb-2" type="submit">Creer mon compte (Agence)</Button>
                                                    <Button className="btn btn-primary w-100" type="button" onClick={handleStudentRegister}>Creer mon compte (Etudiant)</Button>
                                                </div>

                                                <div className="mt-4 text-center">
                                                    <p className="mb-0">Vous avez déjà un compte? <Link to="/login" className="fw-semibold  text-custom-color">Se Connecter</Link></p>
                                                </div>
                                            </Form>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </ParticlesAuth>
            <ToastContainer />
        </React.Fragment>
    );
};

export default RegisterAgency;