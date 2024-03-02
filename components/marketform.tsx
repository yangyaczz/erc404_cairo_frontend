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
import market from '@/lib/market.json';

import Image from 'next/image';

// erc404 token
const CONTRACT_ADDRESS =
    "0x0180624f9918dc685cdc3cc2b31bb21b268fd9abc878d40fa1b487bff0f4bbcd";
const MARKET_ADDRESS =
    "0x009cc31c2c057ffe2b34b7e2b34f7080c59868d4596bf797dfd91358137dbee4";
const ETH_CONTRACT_ADDRESS =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
interface CardMProps {
    id: string;
    imagePath: string;
    idprice: BigInt;
}

const CardM: React.FC<CardMProps> = ({ id, imagePath, idprice }) => {
    const [showButtons, setShowButtons] = useState(false);
    const handleClick = () => {
        setShowButtons(!showButtons);
    };

    // const { contract: erc404_contract } = useContract({
    //     abi: erc404,
    //     address: CONTRACT_ADDRESS,
    // });

    const { contract: market_contract } = useContract({
        abi: market,
        address: MARKET_ADDRESS,
    })

    const { contract: eth_contract } = useContract({
        abi: erc404,
        address: ETH_CONTRACT_ADDRESS,
    })


    const calls = useMemo(() => {
        if ( !market_contract || !eth_contract) return;

        return [
            eth_contract.populateTransaction["approve"](MARKET_ADDRESS, idprice),
            market_contract.populateTransaction["buy"](id),
        ];
    }, [market_contract, eth_contract]);

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
                <p className="text-lg font-bold">{(Number(idprice) / (10 ** 18)).toString()} {'ETH'}</p>

            </div>
            <div className={`flex flex-col items-center justify-center space-y-2 ${showButtons ? 'block' : 'hidden'}`}>


                <form onSubmit={send} className="flex flex-col gap-4 my-4">

                    <button
                        type="submit"
                        className="border bg-gray-400 w-24 h-10"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isPending}
                    >
                        {isPending ? "Buying..." : "Buy"}
                    </button>
                </form>
            </div>
        </div>


    );
};


export default function MarketForm() {

    const [owned, setOwned] = useState([]);
    const [rarity, setRarity] = useState([]);
    const [price, setPrice] = useState([]);

    const { data: ownedData } = useContractRead({
        functionName: "get_owned",
        args: [MARKET_ADDRESS],
        abi: erc404,
        address: CONTRACT_ADDRESS,
        watch: true,
    });

    const { data: rarityData } = useContractRead({
        functionName: "get_branch_rarity",
        args: [MARKET_ADDRESS],
        abi: erc404,
        address: CONTRACT_ADDRESS,
        watch: true,
    });

    const { data: priceData } = useContractRead({
        functionName: "get_branch_price",
        args: [],
        abi: market,
        address: MARKET_ADDRESS,
        watch: true,
    });

    useEffect(() => {
        console.log("Owned data:", ownedData);
        console.log("rarity data:", rarityData);
        console.log("price data:", priceData);

        setOwned(ownedData as never[])
        setRarity(rarityData as never[])
        setPrice(priceData as never[])
    }, [ownedData, rarityData, priceData]);



    return (
        <div className=" my-2 px-32 py-6 border mx-auto grid grid-cols-4 gap-4 items-center justify-center">
            {(owned && rarity && price) && owned.map((id, index) => {
                const imageName = `${(rarity[index] as BigInt).toString()}.jpg`;
                const imagePath = `/pic/${imageName}`;
                const idprice = price[index] as BigInt
                return (
                    <CardM key={(id as BigInt).toString()} id={id} imagePath={imagePath} idprice={idprice} />
                );
            })}
        </div>
    );
}
