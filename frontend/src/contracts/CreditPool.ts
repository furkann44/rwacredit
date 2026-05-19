export const CreditPoolABI = [
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_valuationOracle",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_rwaToken",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_rwaRegistry",
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
                           "name":  "creditId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "borrower",
                           "type":  "address"
                       }
                   ],
        "name":  "CreditDefaulted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "creditId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "borrower",
                           "type":  "address"
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
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "CreditDrawn",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "creditId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "assetId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "CreditLiquidated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "creditId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "borrower",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "CreditRepaid",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "newRate",
                           "type":  "uint256"
                       }
                   ],
        "name":  "InterestRateUpdated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "provider",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "LiquidityDeposited",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "provider",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "LiquidityWithdrawn",
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
        "name":  "DEFAULT_PERIOD",
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
        "name":  "MAX_CREDIT_PER_ASSET",
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
        "name":  "MIN_CREDIT_AMOUNT",
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
        "name":  "annualInterestRate",
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
                           "name":  "creditId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "checkDefault",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
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
        "name":  "credits",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "id",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "borrower",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "assetId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "principal",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "interest",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "totalRepayment",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "amountRepaid",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "startTime",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "dueDate",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum CreditPool.CreditStatus",
                            "name":  "status",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "depositLiquidity",
        "outputs":  [

                    ],
        "stateMutability":  "payable",
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
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "drawCredit",
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
        "name":  "getBalance",
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
                           "name":  "creditId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getCredit",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "id",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "borrower",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "assetId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "principal",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "interest",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "totalRepayment",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "amountRepaid",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "startTime",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "dueDate",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum CreditPool.CreditStatus",
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
                           "name":  "creditId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getCurrentDebt",
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
        "name":  "getPoolInfo",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "totalLiquidity_",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "totalBorrowed_",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "availableLiquidity",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "utilizationRate",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "annualInterestRate_",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "user",
                           "type":  "address"
                       }
                   ],
        "name":  "getUserCredits",
        "outputs":  [
                        {
                            "internalType":  "uint256[]",
                            "name":  "",
                            "type":  "uint256[]"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "liquidityProviders",
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
                           "name":  "creditId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "markAsLiquidated",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
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

                   ],
        "name":  "renounceOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "creditId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "repayCredit",
        "outputs":  [

                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "rwaRegistry",
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
                           "name":  "_valuationOracle",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_rwaToken",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_rwaRegistry",
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
                           "internalType":  "uint256",
                           "name":  "newRate",
                           "type":  "uint256"
                       }
                   ],
        "name":  "setInterestRate",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "totalBorrowed",
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
        "name":  "totalInterestEarned",
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
        "name":  "totalLiquidity",
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
    },
    {
        "inputs":  [

                   ],
        "name":  "valuationOracle",
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
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "withdrawLiquidity",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "stateMutability":  "payable",
        "type":  "receive"
    }
] as const;