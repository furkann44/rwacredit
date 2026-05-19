export const ValuationOracleABI = [
    {
        "inputs":  [

                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
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
                           "internalType":  "string",
                           "name":  "dataType",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "timestamp",
                           "type":  "uint256"
                       }
                   ],
        "name":  "PriceTableUpdated",
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
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "valuationId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "finalValue",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "valuator",
                           "type":  "address"
                       }
                   ],
        "name":  "ValuationApproved",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "valuationId",
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
                           "name":  "estimatedValue",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "dataSource",
                           "type":  "string"
                       }
                   ],
        "name":  "ValuationCreated",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "LTV_REAL_ESTATE",
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
        "name":  "LTV_VEHICLE",
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
        "name":  "PRICE_UPDATE_INTERVAL",
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
        "name":  "VALUATION_VALIDITY",
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
        "name":  "assetValuations",
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
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "authorizedValuators",
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
                           "internalType":  "string",
                           "name":  "",
                           "type":  "string"
                       }
                   ],
        "name":  "baseVehiclePrice",
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
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "isRealEstate",
                           "type":  "bool"
                       }
                   ],
        "name":  "calculateCreditLimit",
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
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "isRealEstate",
                           "type":  "bool"
                       },
                       {
                           "internalType":  "string",
                           "name":  "locationKey",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "areaOrYear",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "additionalParam",
                           "type":  "uint256"
                       }
                   ],
        "name":  "estimateValue",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "valuationId",
                            "type":  "uint256"
                        }
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
                       }
                   ],
        "name":  "getAssetValuation",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "finalValue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "isValid",
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
                           "name":  "valuationId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getValuation",
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
                            "name":  "estimatedValue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "manualValue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "finalValue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "timestamp",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "validUntil",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "valuator",
                            "type":  "address"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "isApproved",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "string",
                            "name":  "dataSource",
                            "type":  "string"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "confidence",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "lastPriceUpdate",
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
                           "internalType":  "string",
                           "name":  "",
                           "type":  "string"
                       }
                   ],
        "name":  "pricePerSqm",
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
        "name":  "renounceOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "valuator",
                           "type":  "address"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "authorized",
                           "type":  "bool"
                       }
                   ],
        "name":  "setValuator",
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
                           "name":  "manualValue",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "dataSource",
                           "type":  "string"
                       }
                   ],
        "name":  "submitManualValuation",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "valuationId",
                            "type":  "uint256"
                        }
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
    },
    {
        "inputs":  [
                       {
                           "internalType":  "string",
                           "name":  "dataType",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string[]",
                           "name":  "keys",
                           "type":  "string[]"
                       },
                       {
                           "internalType":  "uint256[]",
                           "name":  "prices",
                           "type":  "uint256[]"
                       }
                   ],
        "name":  "updatePriceTable",
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
        "name":  "valuations",
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
                            "name":  "estimatedValue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "manualValue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "finalValue",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "timestamp",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "validUntil",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "address",
                            "name":  "valuator",
                            "type":  "address"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "isApproved",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "string",
                            "name":  "dataSource",
                            "type":  "string"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "confidence",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    }
] as const;