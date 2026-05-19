export const P2PLendingABI = [
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "loanId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "borrower",
                           "type":  "address"
                       }
                   ],
        "name":  "LoanDefaulted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "loanId",
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
        "name":  "LoanRepaid",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "offerId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "loanId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "lender",
                           "type":  "address"
                       }
                   ],
        "name":  "OfferAccepted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "offerId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OfferCancelled",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "offerId",
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
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "interestRate",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "duration",
                           "type":  "uint256"
                       }
                   ],
        "name":  "OfferCreated",
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
        "name":  "MAX_DURATION",
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
        "name":  "MAX_INTEREST_RATE",
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
        "name":  "MAX_LOAN_AMOUNT",
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
        "name":  "MIN_INTEREST_RATE",
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
        "name":  "MIN_LOAN_AMOUNT",
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
                           "name":  "offerId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "acceptOffer",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "payable",
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
        "name":  "activeOfferIds",
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
                           "name":  "offerId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "cancelOffer",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "loanId",
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
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "requestedAmount",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "interestRate",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "duration",
                           "type":  "uint256"
                       }
                   ],
        "name":  "createBorrowOffer",
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
        "name":  "getActiveOffers",
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
                           "name":  "borrower",
                           "type":  "address"
                       }
                   ],
        "name":  "getBorrowerLoans",
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
                           "internalType":  "uint256",
                           "name":  "loanId",
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
                       {
                           "internalType":  "address",
                           "name":  "lender",
                           "type":  "address"
                       }
                   ],
        "name":  "getLenderLoans",
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
                           "internalType":  "uint256",
                           "name":  "loanId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getLoan",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "id",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "offerId",
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
                            "name":  "interestRate",
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
                            "internalType":  "enum P2PLending.LoanStatus",
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
                           "name":  "offerId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getOffer",
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
                            "name":  "requestedAmount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "interestRate",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "duration",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum P2PLending.OfferStatus",
                            "name":  "status",
                            "type":  "uint8"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "createdAt",
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
        "name":  "loans",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "id",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "offerId",
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
                            "name":  "interestRate",
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
                            "internalType":  "enum P2PLending.LoanStatus",
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
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "offers",
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
                            "name":  "requestedAmount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "interestRate",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "duration",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum P2PLending.OfferStatus",
                            "name":  "status",
                            "type":  "uint8"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "createdAt",
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
                           "name":  "loanId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "repayLoan",
        "outputs":  [

                    ],
        "stateMutability":  "payable",
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