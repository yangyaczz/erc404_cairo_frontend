import {
    useAccount,
    useBalance,
    useContract,
    useContractWrite,
} from "@starknet-react/core";
import { FormEvent, useMemo, useState } from "react";
import { cairo } from "starknet";
import { truncate } from '@/lib/utils';
import erc404 from '@/lib/erc404.json';
import amm from '@/lib/amm.json';



// ERC20 token
const ERC404_CONTRACT_ADDRESS =
    "0x0180624f9918dc685cdc3cc2b31bb21b268fd9abc878d40fa1b487bff0f4bbcd";
const ETH_CONTRACT_ADDRESS =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const AMM_CONTRACT_ADDRESS =
    "0x02a33096a5709ace5c41edc9e66926104caa607d31bea298cc96127270ad2313";
export default function AmmdexForm() {
    const { address } = useAccount();

    const [amount, setAmount] = useState("");

    // Convenience hook for getting
    // formatted ERC20 balance
    const { data: owner_erc404_balance } = useBalance({
        address,
        token: ERC404_CONTRACT_ADDRESS,
        // watch: true <- refresh at every block
    });

    // const { data: pool_erc404_balance } = useBalance({
    //     address: AMM_CONTRACT_ADDRESS,
    //     token: ERC404_CONTRACT_ADDRESS,
    //     // watch: true <- refresh at every block
    // });

    const { data: owner_eth_balance } = useBalance({
        address,
        token: ETH_CONTRACT_ADDRESS,
        // watch: true <- refresh at every block
    });

    // const { data: pool_eth_balance } = useBalance({
    //     address: AMM_CONTRACT_ADDRESS,
    //     token: ETH_CONTRACT_ADDRESS,
    //     // watch: true <- refresh at every block
    // });

    /*   
    Creates a single instance of a contract
    You can directly call methods on this instance:  
    contract.transfer(...)
    contract.approve(...)
    or use the populateTransaction function to compile calldata 
    for a multicall
    */
    const { contract: erc404_contract } = useContract({
        abi: erc404,
        address: ERC404_CONTRACT_ADDRESS,
    });

    const { contract: amm_contract } = useContract({
        abi: amm,
        address: AMM_CONTRACT_ADDRESS,
    });

    const calls = useMemo(() => {
        if (!amount || !erc404_contract || !owner_erc404_balance || !amm_contract) return;

        // format the amount from a string into a Uint256
        const amountAsUint256 = cairo.uint256(
            BigInt(Number(amount) * 10 ** owner_erc404_balance.decimals)
        );

        return [
            erc404_contract.populateTransaction["approve"](AMM_CONTRACT_ADDRESS, amountAsUint256),
            amm_contract.populateTransaction["swap"](ERC404_CONTRACT_ADDRESS, amountAsUint256)];
    }, [amount, erc404_contract, owner_erc404_balance, amm_contract]);

    // Hook returns function to trigger multicall transaction
    // and state of tx after being sent
    const { write, isPending, data } = useContractWrite({
        calls,
    });

    async function send(event: FormEvent) {
        event.preventDefault();
        write();
    }


    const handleSwap = () => {
    };

    return (
        <div className=" p-6 space-y-6 max-w-[600px] mx-auto  py-6  bg-offblack border border-offwhite">

            <form onSubmit={send} className="flex flex-col gap-4 my-4">
                <div className="">
                    <div className="flex justify-between items-center flex-col w-full">
                        <div className="flex justify-center items-center bg-transparent border border-gray-600 rounded w-full">
                            <input
                                type="text"
                                placeholder="You pay"
                                value={amount}
                                required
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-white bg-transparent px-3 py-2 w-full focus:outline-none text-left"
                            />
                            <div className="text-sm text-white bg-gray-700 p-2 rounded-r">
                                TT404
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        balance: {(owner_erc404_balance?.formatted)}
                    </div>
                </div>


                <button onClick={handleSwap} className="flex justify-center items-center bg-gray-700 rounded-lg w-10 h-10 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                </button>


                <div className="">
                    <div className="flex justify-between items-center">
                        <div className="flex justify-center items-center bg-transparent border border-gray-600 rounded w-full">
                            <input
                                type="number"
                                placeholder="You receive"
                                // value={bottomValue}
                                readOnly
                                className="text-white bg-transparent px-3 py-2 w-full focus:outline-none text-left"
                            />
                            <div className="text-sm text-white bg-gray-700 p-2 rounded-r">
                                SNETH
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        balance: {owner_eth_balance?.formatted}
                    </div>
                </div>
                <button type="submit" className="btn w-full text-white p-3 rounded" disabled={isPending}>
                    {isPending ? "Swaping..." : "Swap"}
                </button>
            </form>
            {isPending && <p>tx pending...</p>}
            {data && (
                <p className="whitespace-pre-wrap break-words">
                    Tx: {data.transaction_hash}
                </p>
            )}
        </div>
    );
}
