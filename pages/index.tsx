import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useAccount } from "@starknet-react/core";

import Connect from "@/components/connect";
import Info from "@/components/info";
import SignForm from "@/components/signform";
import TokenForm from "@/components/tokenform";
import ClaimForm from "@/components/claimform";
import MyNFTForm from "@/components/mynftform";
import AmmdexForm from "@/components/ammdexform";
import MarketForm from "@/components/marketform";



import NetworkInfo from "@/components/networkinfo";

import Link from 'next/link'
import React, { useState } from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { isConnected, address } = useAccount();

  const [currentView, setCurrentView] = useState('claim');

  const isActive = (viewName: any) => currentView === viewName ? 'bg-slate-500 text-white' : 'bg-transparent';

  const renderView = () => {
    switch (currentView) {
      case 'ammdex':
        return <div className='w-full'>
        <AmmdexForm />
      </div>;
      case 'token':
        return <div className='w-full'>
          <TokenForm />
        </div>;
      case 'claim':
        return <div className='w-1/3'>
        <ClaimForm />
      </div>;
      case 'mynft':
        return <div className='w-full'>
        <MyNFTForm />
      </div>;
      case 'market':
        return <div className='w-full'>
        <MarketForm />
      </div>;
      default:
        return <div>claim</div>;
    }
  };

  return (
    <main className='h-screen'>
      <div className="h-full p-4 flex flex-col">
        <section className="flex justify-end">
          <Info />
          {/* <SignForm /> */}
        </section>
        <div className="flex-1 flex items-center text-center justify-center h-full">
          {isConnected ? (
            <main className='h-screen'>
              <div className="h-full p-4 flex flex-col pt-20">
                <section className="flex justify-center space-x-20 ">
                  <button className={`border border-slate-500 px-4 py-1 ${isActive('ammdex')}`} onClick={() => setCurrentView('ammdex')}>AMMDEX</button>
                  <button className={`border border-slate-500 px-4 py-1 ${isActive('token')}`} onClick={() => setCurrentView('token')}>TOKEN</button>
                  <button className={`border border-slate-500 px-4 py-1 ${isActive('claim')}`} onClick={() => setCurrentView('claim')}>CLAIM</button>
                  <button className={`border border-slate-500 px-4 py-1 ${isActive('mynft')}`} onClick={() => setCurrentView('mynft')}>MYNFT</button>
                  <button className={`border border-slate-500 px-4 py-1 ${isActive('market')}`} onClick={() => setCurrentView('market')}>MARKET</button>
                </section>

                <div className="flex-1 flex items-center text-center justify-center h-full">
                  {renderView()}
                </div>
              </div>
            </main>
          )
            : (
              <Connect />
            )}
          <NetworkInfo />
        </div>
      </div>
    </main>
  )
}
