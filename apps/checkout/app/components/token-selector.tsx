"use client"

import { useState } from "react"
import Image from "next/image"
import { Token, SUPPORTED_TOKENS } from "../config/tokens"

interface TokenSelectorProps {
  selectedToken: Token
  onSelect: (token: Token) => void
}

export function TokenSelector({ selectedToken, onSelect }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-2 hover:bg-gray-800/70 transition-colors"
      >
        <Image
          src={selectedToken.logoURI}
          alt={selectedToken.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="text-white font-medium">{selectedToken.symbol}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-gray-900 rounded-lg shadow-xl z-10">
          <div className="p-2 space-y-1">
            {SUPPORTED_TOKENS.map((token) => (
              <button
                key={token.mint}
                onClick={() => {
                  onSelect(token)
                  setIsOpen(false)
                }}
                className={`flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors ${
                  selectedToken.mint === token.mint ? "bg-gray-800/70" : ""
                }`}
              >
                <Image
                  src={token.logoURI}
                  alt={token.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="text-white">{token.symbol}</span>
                <span className="text-gray-400 text-sm ml-auto">{token.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 