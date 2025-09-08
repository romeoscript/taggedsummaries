/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tagged_summaries.json`.
 */
export type TaggedSummaries = {
  "address": "F8qn46JxkYB3koH2tZc38qceCK3PHQ5PafaJR6u5AyD7",
  "metadata": {
    "name": "taggedSummaries",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialize",
      "docs": [
        "Initialize the global summary store"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "summaryStore",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  109,
                  109,
                  97,
                  114,
                  121,
                  95,
                  115,
                  116,
                  111,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "storeTaggedSummary",
      "docs": [
        "Store AI-generated metadata for a campus transaction"
      ],
      "discriminator": [
        162,
        209,
        213,
        124,
        174,
        65,
        80,
        198
      ],
      "accounts": [
        {
          "name": "taggedSummary",
          "writable": true
        },
        {
          "name": "summaryStore",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  109,
                  109,
                  97,
                  114,
                  121,
                  95,
                  115,
                  116,
                  111,
                  114,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "student",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "transactionHash",
          "type": "string"
        },
        {
          "name": "summary",
          "type": "string"
        },
        {
          "name": "tags",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "category",
          "type": "string"
        },
        {
          "name": "confidenceScore",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "summaryStore",
      "discriminator": [
        17,
        251,
        92,
        202,
        242,
        205,
        34,
        113
      ]
    },
    {
      "name": "taggedSummary",
      "discriminator": [
        254,
        19,
        124,
        133,
        84,
        230,
        133,
        226
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "tooManyTags",
      "msg": "Too many tags (maximum 15 allowed)"
    },
    {
      "code": 6001,
      "name": "summaryTooLong",
      "msg": "Summary too long (maximum 800 characters)"
    },
    {
      "code": 6002,
      "name": "invalidConfidence",
      "msg": "Invalid confidence score (0-100 only)"
    },
    {
      "code": 6003,
      "name": "invalidHash",
      "msg": "Transaction hash must be 64 characters"
    }
  ],
  "types": [
    {
      "name": "summaryStore",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "totalSummaries",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "taggedSummary",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "transactionHash",
            "type": "string"
          },
          {
            "name": "summary",
            "type": "string"
          },
          {
            "name": "tags",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "confidenceScore",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "studentWallet",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
