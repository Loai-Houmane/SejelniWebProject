import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

function withRouter(Component) {

    function ComponentWithRouterProp(props) {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();
        // console.log("withRouter: location", location);
        // console.log("withRouter: navigate", navigate);
        // console.log("withRouter: params", params);
        return (
            <Component
                {...props}
                router={{ location, navigate, params }}
            />
        );
    }

    return ComponentWithRouterProp;
}

export default withRouter;