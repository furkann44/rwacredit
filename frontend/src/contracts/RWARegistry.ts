export const RWARegistryABI = [
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum RWARegistry.AssetType",
                           "name":  "assetType",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum RWARegistry.AssetStatus",
                           "name":  "status",
                           "type":  "uint8"
                       }
                   ],
        "name":  "AssetRegistered",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum RWARegistry.AssetStatus",
                           "name":  "oldStatus",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum RWARegistry.AssetStatus",
                           "name":  "newStatus",
                           "type":  "uint8"
                       }
                   ],
        "name":  "AssetStatusChanged",
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
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "valuationId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ValuationLinked",
        "type":  "event"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "assets",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "id",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum RWARegistry.AssetType",
                            "name":  "assetType",
                            "type":  "uint8"
                        },
                        {
                            "internalType":  "enum RWARegistry.AssetStatus",
                            "name":  "status",
                            "type":  "uint8"
                        },
                        {
                            "internalType":  "address",
                            "name":  "owner",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "createdAt",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "valuationId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "creditId",
                            "type":  "uint256"
                        },
                        {
                            "components":  [
                                               {
                                                   "internalType":  "enum RWARegistry.City",
                                                   "name":  "city",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "district",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "neighborhood",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "plotNumber",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "parcelNumber",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "area",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "enum RWARegistry.PropertyType",
                                                   "name":  "propertyType",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "enum RWARegistry.TitleDeedType",
                                                   "name":  "titleDeedType",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "locationInfo",
                                                   "type":  "string"
                                               }
                                           ],
                            "internalType":  "struct RWARegistry.RealEstateInfo",
                            "name":  "realEstate",
                            "type":  "tuple"
                        },
                        {
                            "components":  [
                                               {
                                                   "internalType":  "string",
                                                   "name":  "plate",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "chassisNumber",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "brand",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "model",
                                                   "type":  "string"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "year",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "mileage",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "string",
                                                   "name":  "fuelType",
                                                   "type":  "string"
                                               }
                                           ],
                            "internalType":  "struct RWARegistry.VehicleInfo",
                            "name":  "vehicle",
                            "type":  "tuple"
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
                           "internalType":  "enum RWARegistry.AssetStatus",
                           "name":  "newStatus",
                           "type":  "uint8"
                       }
                   ],
        "name":  "changeAssetStatus",
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
                       }
                   ],
        "name":  "getAsset",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "id",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum RWARegistry.AssetType",
                            "name":  "assetType",
                            "type":  "uint8"
                        },
                        {
                            "internalType":  "enum RWARegistry.AssetStatus",
                            "name":  "status",
                            "type":  "uint8"
                        },
                        {
                            "internalType":  "address",
                            "name":  "owner",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "createdAt",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "valuationId",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "creditId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "getAssetCounter",
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
                           "name":  "user",
                           "type":  "address"
                       }
                   ],
        "name":  "getUserAssets",
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
                           "name":  "assetId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "valuationId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "linkValuation",
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
        "name":  "pause",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
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
                           "internalType":  "uint8",
                           "name":  "city",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "string",
                           "name":  "district",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "neighborhood",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "plotNumber",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "parcelNumber",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "area",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint8",
                           "name":  "propertyType",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "uint8",
                           "name":  "titleDeedType",
                           "type":  "uint8"
                       },
                       {
                           "internalType":  "string",
                           "name":  "locationData",
                           "type":  "string"
                       }
                   ],
        "name":  "registerRealEstate",
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
                       {
                           "internalType":  "string",
                           "name":  "plate",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "chassisNumber",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "brand",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "model",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "year",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "mileage",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "fuelType",
                           "type":  "string"
                       }
                   ],
        "name":  "registerVehicle",
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
        "name":  "unpause",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;