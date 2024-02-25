import {
    useAccount,
    useBalance,
    useContract,
    useContractWrite,
} from "@starknet-react/core";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { cairo } from "starknet";
import { truncate } from '@/lib/utils';
import erc404 from '@/lib/erc404.json';
import Image from 'next/image';


// ERC20 token
const CONTRACT_ADDRESS =
    "0x0180624f9918dc685cdc3cc2b31bb21b268fd9abc878d40fa1b487bff0f4bbcd";

export default function ClaimForm() {
    const images = [
        '/pic/1.jpg',
        '/pic/2.jpg',
        '/pic/3.jpg',
        '/pic/4.jpg',
        '/pic/5.jpg',
    ];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);


    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 500);

        return () => clearInterval(timer);
    }, []);

    const { address } = useAccount();

    // Convenience hook for getting
    // formatted ERC20 balance
    const { data: balance } = useBalance({
        address,
        token: CONTRACT_ADDRESS,
        // watch: true <- refresh at every block
    });

    /*   
    Creates a single instance of a contract
    You can directly call methods on this instance:  
    contract.transfer(...)
    contract.approve(...)
    or use the populateTransaction function to compile calldata 
    for a multicall
    */
    const { contract } = useContract({
        abi: erc404,
        address: CONTRACT_ADDRESS,
    });

    const calls = useMemo(() => {
        if (!contract || !balance) return;

        // format the amount from a string into a Uint256
        //   const amountAsUint256 = cairo.uint256(
        //     BigInt(Number(amount) * 10 ** balance.decimals)
        //   );

        return contract.populateTransaction["claim"]();

        //   return contract.populateTransaction["transfer"](to, amountAsUint256);


    }, [contract, balance]);

    // Hook returns function to trigger multicall transaction
    // and state of tx after being sent
    const { write, isPending, data } = useContractWrite({
        calls,
    });

    async function send(event: FormEvent) {
        event.preventDefault();
        write();
    }

    return (
        <div className=" my-8 px-8 py-6 bg-offblack border border-offwhite text-center max-w-[600px] mx-auto">

            <div className="relative w-full">
                <Image
                    src={images[currentImageIndex]}
                    alt="Slideshow"
                    width={500}
                    height={500}
                    objectFit="cover"
                    priority
                />
            </div>

            <form onSubmit={send} className="flex flex-col gap-4 my-4">

                <button type="submit" className="btn" disabled={isPending}>
                    {isPending ? "Claiming..." : "Claim"}
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
