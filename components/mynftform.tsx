import {
    useAccount,
    useContract,
    useContractWrite,
    useContractRead
} from "@starknet-react/core";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { cairo } from "starknet";
import { truncate } from '@/lib/utils';
import erc404 from '@/lib/erc404.json';
import Image from 'next/image';

// erc404 token
const CONTRACT_ADDRESS =
    "0x0180624f9918dc685cdc3cc2b31bb21b268fd9abc878d40fa1b487bff0f4bbcd";

interface CardProps {
    id: string;
    imagePath: string; 
    address: string;
}

const Card: React.FC<CardProps> = ({ id, imagePath, address }) => {
    const [showButtons, setShowButtons] = useState(false);
    const handleClick = () => {
        setShowButtons(!showButtons);
    };

    const [to, setTo] = useState("");

    const { contract } = useContract({
        abi: erc404,
        address: CONTRACT_ADDRESS,
    });


    const calls = useMemo(() => {
        if (!contract || !to) return;

        return contract.populateTransaction["transfer_from"](address, to, id);
    }, [contract]);

    const { write, isPending, data } = useContractWrite({
        calls,
    });

    async function send(event: FormEvent) {
        event.preventDefault();
        write();
    }


    return (
        <div
            className={`p-4 border border-gray-200 shadow-lg relative flex flex-col justify-center items-center cursor-pointer `}
            onClick={handleClick}
            style={{
                width: '120px',
                height: '200px',
                backgroundColor: showButtons ? 'rgba(255, 255, 255, 0.7)' : 'transparent'
            }}
        >
            <div className={`${showButtons ? 'hidden' : 'block'}`}>
                <p className="text-lg font-bold">#{id.toString()}</p>
                <div className="my-4">
                    <Image src={imagePath} alt={`NFT ${id}`} width={100} height={100} objectFit="cover" />
                </div>
            </div>
            <div className={`flex flex-col items-center justify-center space-y-2 ${showButtons ? 'block' : 'hidden'}`}>


                <form onSubmit={send} className="flex flex-col gap-4 my-4">

                    <input
                        className="border w-24 h-10"
                        type="text"
                        name="to"
                        placeholder="Recipient"
                        required
                        onChange={(e) => {
                            setTo(e.target.value)
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    />

                    <button
                        type="submit"
                        className="border bg-gray-400 w-24 h-10"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isPending}
                    >
                        {isPending ? "Sending..." : "Transfer"}
                    </button>

                    <button className="border bg-gray-400 w-24 h-10" onClick={(e) => e.stopPropagation()}>Roll</button>

                </form>
            </div>
        </div>


    );
};


export default function MyNFTForm() {
    const { address } = useAccount();

    const [owned, setOwned] = useState([]);
    const [rarity, setRarity] = useState([]);


    const { data: ownedData } = useContractRead({
        functionName: "get_owned",
        args: [address as string],
        abi: erc404,
        address: CONTRACT_ADDRESS,
        watch: true,
    });

    const { data: rarityData } = useContractRead({
        functionName: "get_branch_rarity",
        args: [address as string],
        abi: erc404,
        address: CONTRACT_ADDRESS,
        watch: true,
    });

    useEffect(() => {
        console.log("Owned data:", ownedData);
        console.log("rarity data:", rarityData);

        setOwned(ownedData as never[])
        setRarity(rarityData as never[])
    }, [ownedData, rarityData]);



    return (
        <div className=" my-2 px-32 py-6 border mx-auto grid grid-cols-4 gap-4 items-center justify-center">
            {(owned && rarity) && owned.map((id, index) => {
                const imageName = `${(rarity[index] as BigInt).toString()}.jpg`;
                const imagePath = `/pic/${imageName}`;
                return (
                    <Card key={(id as BigInt).toString()} id={id} imagePath={imagePath} address={address as string} />
                );
            })}
        </div>
    );
}
