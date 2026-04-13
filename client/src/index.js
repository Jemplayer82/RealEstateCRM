import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "assets/css/App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import AuthLayout from "./layouts/auth";
import AdminLayout from "layouts/admin";
import UserLayout from "layouts/user";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "theme/theme";
import { ThemeEditorProvider } from "@hypertheme-editor/chakra-ui";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import Setup from "views/auth/setup";
import { constant } from "constant";
import Spinner from "components/spinner/Spinner";
import { Flex } from "@chakra-ui/react";

function App() {
  const [setupComplete, setSetupComplete] = useState(null); // null = loading
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`${constant.baseUrl}api/user/setup-status`)
      .then((res) => res.json())
      .then((data) => {
        setSetupComplete(data.setupComplete);
        if (!data.setupComplete) {
          navigate("/setup");
        }
      })
      .catch(() => {
        // If we can't reach the server, assume setup is done to avoid boot-loop
        setSetupComplete(true);
      });
  }, []);

  // Show spinner while checking setup status
  if (setupComplete === null) {
    return (
      <Flex justifyContent="center" alignItems="center" width="100%" height="100vh">
        <Spinner />
      </Flex>
    );
  }

  // Setup not done — show setup page
  if (!setupComplete) {
    return (
      <Routes>
        <Route
          path="/setup"
          element={<Setup onSetupComplete={() => setSetupComplete(true)} />}
        />
        <Route path="/*" element={<Setup onSetupComplete={() => setSetupComplete(true)} />} />
      </Routes>
    );
  }

  // Normal app routing
  return (
    <>
      <ToastContainer />
      <Routes>
        {token && user?.role ? (
          user?.role === "user" ? (
            <Route path="/*" element={<UserLayout />} />
          ) : user?.role === "superAdmin" ? (
            <Route path="/*" element={<AdminLayout />} />
          ) : (
            ""
          )
        ) : (
          <Route path="/*" element={<AuthLayout />} />
        )}
      </Routes>
    </>
  );
}

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ChakraProvider theme={theme}>
        <React.StrictMode>
          <ThemeEditorProvider>
            <Router>
              <App />
            </Router>
          </ThemeEditorProvider>
        </React.StrictMode>
      </ChakraProvider>
    </PersistGate>
  </Provider>,
  document.getElementById("root"),
);
