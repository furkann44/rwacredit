export const LiquidationABI = [
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_creditPool",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_p2pLending",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_rwaToken",
                           "type":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "AuctionCancelled",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "startingPrice",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "endTime",
                           "type":  "uint256"
                       }
                   ],
        "name":  "AuctionCreated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "winner",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "AuctionEnded",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "bidder",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "BidPlaced",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "previousOwner",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnershipTransferred",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "Paused",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "Unpaused",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "AUCTION_DURATION",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "MIN_BID_INCREMENT",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "PENALTY_RATE",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "assetAuctions",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "auctions",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "id",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "assetId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "creditId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "borrower",
                            "type":  "address"
                        },
                        {
                            "internalType":  "address",
                            "name":  "lender",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "debtAmount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "startingPrice",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "highestBid",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "highestBidder",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "startTime",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "endTime",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum Liquidation.AuctionStatus",
                            "name":  "status",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "cancelAuction",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "creditId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "borrower",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "lender",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "debtAmount",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "startingPrice",
                           "type":  "uint256"
                       }
                   ],
        "name":  "createAuction",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "creditPool",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "endAuction",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getAuction",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "id",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "assetId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "creditId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "borrower",
                            "type":  "address"
                        },
                        {
                            "internalType":  "address",
                            "name":  "lender",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "debtAmount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "startingPrice",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "highestBid",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "highestBidder",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "startTime",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "endTime",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum Liquidation.AuctionStatus",
                            "name":  "status",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getMinBid",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "owner",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "p2pLending",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "paused",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "auctionId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "placeBid",
        "outputs":  [

                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "renounceOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "rwaToken",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_creditPool",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_p2pLending",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_rwaToken",
                           "type":  "address"
                       }
                   ],
        "name":  "setContractAddresses",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "transferOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;