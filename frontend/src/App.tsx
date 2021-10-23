import "./App.css";
import { Menu } from "./Menu";
import "bootstrap/dist/css/bootstrap.min.css";
import ContractBox from "./common/ContractBox";
import { Container } from "react-bootstrap";
import * as contexts from './contexts'
export default function App() {
  // store greeting in local state

  // request access to the user's MetaMask account

  return (
    <div className="App">
      <contexts.Web3ProviderProvider>
          <contexts.ViewProvider>
            <Container>
              <Menu />
              <ContractBox />
            </Container>
          </contexts.ViewProvider>
      </contexts.Web3ProviderProvider>
    </div>
  );
}
