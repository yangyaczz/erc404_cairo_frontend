import { useConnect } from "@starknet-react/core";

export default function Connect() {
  const { connect, connectors } = useConnect();

  return (
    <div>
      <h1 className="title font-semibold text-3xl shadowed mb-10">CONNECT TO EXPLORE ERC404</h1>
      <div className="flex justify-center gap-8">
        {connectors.map((connector) => (
          <button
            className="btn"
            onClick={() => connect({ connector })}
            key={connector.id}
            disabled={!connector.available()}
          >
            Connect {connector.id}
          </button>
        ))}
      </div>
    </div>

  );
}
