import { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import apiService from "./services/api.service";
import { AuthProvider } from "./common/useAuthContext";
import Role from "./common/Role";
import { PrivateRoute } from "./components/PrivateRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Connect from "./pages/Connect";
import Documents from "./pages/Documents";
import Integrations from "./pages/Integrations";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ScreenShare from "./pages/ScreenShare";
import NoMatch from "./pages/404";

import "react-toastify/dist/ReactToastify.css";

import { pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export default function App() {
  useEffect(() => {
    apiService.checkLogin();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Switch>
            <PrivateRoute exact path="/" component={Home} />
            <PrivateRoute path="/documents/:itemId?" component={Documents} />
            <PrivateRoute path="/connect" component={Connect} />
            <PrivateRoute path="/pair/app" component={Connect} />
            <PrivateRoute path="/pair" component={Connect} />
            <PrivateRoute path="/integrations" component={Integrations} />
            <PrivateRoute path="/profile" component={Profile} />
            <PrivateRoute path="/screenshare" component={ScreenShare} />
            <PrivateRoute path="/admin" roles={[Role.Admin]} component={Admin} />

            <Route path="/login" component={Login} />
            <Route component={NoMatch} />
          </Switch>
        </Layout>
      </Router>
      <ToastContainer autoClose={2500} position="bottom-right" />
    </AuthProvider>
  );
}
