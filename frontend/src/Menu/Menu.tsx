import { Navbar, Container, Button } from "react-bootstrap";
import { Web3Provider } from "@ethersproject/providers";
import { useState, useEffect } from "react";
import * as enums from "../enums";
import * as contexts from "../contexts";

function NetworkedButton(props: { web3Provider: Web3Provider }) {
  const [network, setNetwork] = useState("");

  useEffect(() => {
    const network = props.web3Provider.getNetwork();
    network.then(networkName => setNetwork(networkName.name));
  }, [props.web3Provider]);

  return <Button variant="success">{`Connected To MetaMask: ${network}`}</Button>;
}

export default Menu;

function Menu() {
  function renderButtons(view, setView) {
    return Object.entries(enums.View)
      .filter(([key, value]) => typeof value === "string")
      .map(([key, value]) => (
        <Button key={key} onClick={() => setView(value)} variant={`${view === value ? "" : "outline-"}primary`}>
          {value}
        </Button>
      ));
  }

  return (
    <contexts.Web3Provider.Consumer>
      {({ web3Provider, setWeb3Provider, connectToWeb3Provider }) => (
        <contexts.View.Consumer>
          {({ view, setView }) => (
            <Navbar bg="light" expand="lg">
              <Container>
                <Navbar.Brand href="#home">SpaceCoin</Navbar.Brand>
                {renderButtons(view, setView)}
                {web3Provider ? (
                  <NetworkedButton web3Provider={web3Provider} />
                ) : (
                  <Button variant="warning" onClick={connectToWeb3Provider}>
                    Connect To Metamask
                  </Button>
                )}
              </Container>
            </Navbar>
          )}
        </contexts.View.Consumer>
      )}
    </contexts.Web3Provider.Consumer>
  );
}
