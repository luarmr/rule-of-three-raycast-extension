import { Form, ActionPanel, Action, showToast, Detail } from "@raycast/api";
import { useState } from "react";

type Values = {
  valueA: string;
  valueB: string;
  valueC: string;
  valueD: string;
};

function calculate(values: Values) {
  const { valueA, valueB, valueC, valueD } = values;
  const nums = [valueA, valueB, valueC, valueD].map((v) => (v === "x" || v === "" ? null : parseFloat(v)));

  const nullIndex = nums.indexOf(null);
  if (nums.filter((n) => n === null).length !== 1) {
    return null; // Ensure exactly one value is null
  }

  const [numA, numB, numC, numD] = nums;

  switch (nullIndex) {
    case 0:
      return (numB! * numD!) / numC!;
    case 1:
      return (numA! * numC!) / numD!;
    case 2:
      return (numA! * numD!) / numB!;
    case 3:
      return (numC! * numB!) / numA!;
    default:
      return null;
  }
}

function ResultView({ values, onBack }: { values: Values; onBack: () => void }) {
  const { valueA, valueB, valueC, valueD } = values;
  const calculatedValue = calculate(values);

  const result = calculatedValue !== null ? `X = ${calculatedValue}` : "Calculation Error";
  const copyResult = calculatedValue !== null ? `${calculatedValue}` : "Calculation Error";

  const formattedA = (valueA || "X").padStart(10, " ");
  const formattedB = (valueB || "X").padEnd(10, " ");
  const formattedC = (valueC || "X").padStart(10, " ");
  const formattedD = (valueD || "X").padEnd(10, " ");

  const markdown = `
# Rule of Three Calculation Result

\`\`\`
${formattedA} -> ${formattedB}
${formattedC} -> ${formattedD}
\`\`\`


## ${result}

`;

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Result to Clipboard" content={copyResult} />
          <Action title="Back" onAction={onBack} />
        </ActionPanel>
      }
    />
  );
}

export default function Command() {
  const [values, setValues] = useState<Values>({ valueA: "", valueB: "", valueC: "", valueD: "" });
  const [showResult, setShowResult] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string | undefined }>({});

  const validateInput = (input: string) => {
    if (input === "" || input === "x") {
      return true;
    }
    const validFormat = /^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(input); // avoiding cases like 234r34
    return validFormat && isFinite(parseFloat(input));
  };

  const handleValidation = (key: keyof Values, value: string) => {
    setValidationErrors((prev) => ({
      ...prev,
      [key]: validateInput(value) ? undefined : "Invalid input",
    }));
  };

  const generateDescription = () => {
    const { valueA, valueB, valueC, valueD } = values;
    const formattedA = validateInput(valueA) ? valueA || "A" : "A";
    const formattedB = validateInput(valueB) ? valueB || "B" : "B";
    const formattedC = validateInput(valueC) ? valueC || "C" : "C";
    const formattedD = validateInput(valueD) ? valueD || "D" : "D";

    return `Enter three values to calculate the fourth using the Rule of Three. Leave one field empty or type 'x' to calculate that value.
${formattedA} -> ${formattedB}
${formattedC} -> ${formattedD}`;
  };

  function handleSubmit(values: Values) {
    const { valueA, valueB, valueC, valueD } = values;

    const errors: { [key: string]: string | undefined } = {
      valueA: validateInput(valueA) ? undefined : "Invalid input",
      valueB: validateInput(valueB) ? undefined : "Invalid input",
      valueC: validateInput(valueC) ? undefined : "Invalid input",
      valueD: validateInput(valueD) ? undefined : "Invalid input",
    };

    setValidationErrors(errors);

    if (Object.values(errors).some((error) => error !== undefined)) {
      showToast({ title: "Invalid input", message: "Please enter valid numbers or 'x' only" });
      return;
    }

    const numA = valueA === "x" || valueA === "" ? null : parseFloat(valueA);
    const numB = valueB === "x" || valueB === "" ? null : parseFloat(valueB);
    const numC = valueC === "x" || valueC === "" ? null : parseFloat(valueC);
    const numD = valueD === "x" || valueD === "" ? null : parseFloat(valueD);

    if ([numA, numB, numC, numD].filter((value) => value === null).length !== 1) {
      showToast({ title: "Invalid input", message: "Please leave exactly one field empty or type 'x'" });
      return;
    }

    setShowResult(true);
  }

  function handleBack() {
    setShowResult(false);
  }

  return showResult ? (
    <ResultView values={values} onBack={handleBack} />
  ) : (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text={generateDescription()} />
      <Form.TextField
        id="valueA"
        title="Value A"
        placeholder="Enter the first value or 'x'"
        value={values.valueA}
        onChange={(newValue) => {
          setValues((prev) => ({ ...prev, valueA: newValue }));
          handleValidation("valueA", newValue);
        }}
        error={validationErrors.valueA}
      />
      <Form.TextField
        id="valueB"
        title="Value B"
        placeholder="Enter the second value or 'x'"
        value={values.valueB}
        onChange={(newValue) => {
          setValues((prev) => ({ ...prev, valueB: newValue }));
          handleValidation("valueB", newValue);
        }}
        error={validationErrors.valueB}
      />
      <Form.TextField
        id="valueC"
        title="Value C"
        placeholder="Enter the third value or 'x'"
        value={values.valueC}
        onChange={(newValue) => {
          setValues((prev) => ({ ...prev, valueC: newValue }));
          handleValidation("valueC", newValue);
        }}
        error={validationErrors.valueC}
      />
      <Form.TextField
        id="valueD"
        title="Value D"
        placeholder="Enter the fourth value or 'x'"
        value={values.valueD}
        onChange={(newValue) => {
          setValues((prev) => ({ ...prev, valueD: newValue }));
          handleValidation("valueD", newValue);
        }}
        error={validationErrors.valueD}
      />
    </Form>
  );
}
