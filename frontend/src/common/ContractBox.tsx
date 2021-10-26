import { Container, Button, Row } from "react-bootstrap";
import FunctionRow from "./FunctionRow";
import { Contract, utils } from "ethers";
import * as contexts from "../contexts";
import * as enums from "../enums";

export default function ContractBox() {
  const connectToDeployedContract = (view, web3Provider): Contract & utils.Interface => {
    try {
      const provider = web3Provider;
      const signer = provider.getSigner();
      const { factory, envKey } = enums.Contracts[enums.View.getKey(view)];
      const deployedContract = factory.connect(process.env[envKey], signer);
      return deployedContract;
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <contexts.Web3Provider.Consumer>
      {({ web3Provider, setWeb3Provider, connectToWeb3Provider }) => (
        <contexts.View.Consumer>
          {({ view, setView }) => {
            const deployedContract = connectToDeployedContract(view, web3Provider);
            if (!deployedContract) return null;
            return (
              <Container>
                <Row>
                  <div>{`Contract Deployed At: ${deployedContract.address}`}</div>
                </Row>
                {Object.entries(deployedContract.interface.functions).map(([key, entry], index) => (
                  <FunctionRow
                    function={deployedContract.functions[key]}
                    contractEntry={entry}
                    key={key + index.toString()}
                  />
                ))}
              </Container>
            );
          }}
        </contexts.View.Consumer>
      )}
    </contexts.Web3Provider.Consumer>
  );
}
