import { useState, useEffect } from "react";
import { Button, Row, Col, InputGroup, FormControl } from "react-bootstrap";
import { ContractFunction } from "@ethersproject/contracts";
import { utils, BigNumber } from "ethers";
interface Props {
  function: ContractFunction;
  contractEntry: utils.FunctionFragment;
}
export default function FunctionRow(props: Props) {
  const firstState = props.contractEntry.inputs.map(() => "");
  const [inputs, setInputs] = useState(firstState as Array<string>);
  const [outputs, setOutputs] = useState([] as string[]);
  const [args, setArgs] = useState([]);
  const [override, setOverride] = useState(null);

  async function onClick(event): Promise<void> {
    try {
      const cleanInputs = inputs.map((item, index) => {
        if (item === "true") {
          return true;
        }
        if (item === "false") {
          return false;
        }
        if (index > props.contractEntry.inputs.length - 1 && props.contractEntry.inputs[index]?.type === "uint256") {
          return utils.parseEther(item).toString();
        }
        return item;
      }) as Array<string | { value: BigNumber }>;

      if (override) {
        const lastIndex = cleanInputs.length - 1;
        cleanInputs[lastIndex] = {
          value: utils.parseEther(cleanInputs[lastIndex] as string),
        };
      }
      try {
        const output = await props.function(...cleanInputs);
        if (Array.isArray(output)) {
          setOutputs(
            output.map((item, index) => {
              return props.contractEntry.outputs[index].type === "uint256"
                ? utils.formatUnits(item.toString(), "ether").toString()
                : item.toString();
            }),
          );
        } else {
          setOutputs(["success"]);
        }
      } catch (err) {
        console.log(cleanInputs);
        throw err;
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const args = props.contractEntry.inputs;
    setArgs(args);
    if (props.contractEntry.payable) {
      setOverride({ name: "sendEther", type: "uint256" });
    } else {
      setOverride(null);
    }
  }, [props.contractEntry]);

  return (
    <Row>
      <Col>
        <div>{props.contractEntry.name}</div>
      </Col>
      <Col>
        {[...args, override].filter(Boolean).map((arg, index) => (
          <InputGroup className="mb-3" key={arg + index.toString()}>
            <InputGroup.Text id="basic-addon1">{arg.name}</InputGroup.Text>
            <FormControl
              placeholder={arg.type}
              aria-describedby="basic-addon1"
              value={inputs[index]}
              onChange={event => {
                const newInputs = [...inputs];
                newInputs[index] = event.target.value;
                setInputs(newInputs);
              }}
            />
          </InputGroup>
        ))}
      </Col>
      <Col>
        <Button onClick={onClick}>Execute Transaction</Button>
      </Col>
      <Col>
        {outputs.map((item, index) => (
          <InputGroup className="mb-3" key={index.toString() + item.toString()}>
            <InputGroup.Text id="basic-addon1">{props.contractEntry.outputs[index]?.baseType ?? ""}</InputGroup.Text>
            <FormControl aria-label="Username" aria-describedby="basic-addon1" value={outputs[index]} readOnly />
          </InputGroup>
        ))}
      </Col>
    </Row>
  );
}
