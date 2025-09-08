/**
 * Program IDL types for the Tagged Summaries program
 */

export interface TaggedSummaries {
  "address": "DFauwKZzbAymC7J68f2L2rL56S2t5sAboyNyvRJ82k6t";
  "metadata": {
    "name": "taggedSummaries";
    "version": "0.1.0";
    "spec": "0.1.0";
    "description": "Created with Anchor";
  };
  "instructions": [
    {
      "name": "initialize";
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237];
      "accounts": [
        {
          "name": "summaryStore";
          "writable": true;
          "pda": {
            "seeds": [
              {
                "kind": "const";
                "value": [115, 117, 109, 109, 97, 114, 121, 95, 115, 116, 111, 114, 101];
              }
            ];
          };
        };
        {
          "name": "authority";
          "writable": true;
          "signer": true;
        };
        {
          "name": "systemProgram";
          "address": "11111111111111111111111111111111";
        };
      ];
      "args": [];
    };
    {
      "name": "storeTaggedSummary";
      "docs": ["Store AI-generated metadata for a campus transaction"];
      "discriminator": [162, 209, 213, 124, 174, 65, 80, 198];
      "accounts": [
        {
          "name": "taggedSummary";
          "writable": true;
          "pda": {
            "seeds": [
              {
                "kind": "const";
                "value": [116, 97, 103, 103, 101, 100, 95, 115, 117, 109, 109, 97, 114, 121];
              };
              {
                "kind": "arg";
                "path": "transactionHash";
              };
              {
                "kind": "account";
                "path": "student";
              };
            ];
          };
        };
        {
          "name": "summaryStore";
          "writable": true;
          "pda": {
            "seeds": [
              {
                "kind": "const";
                "value": [115, 117, 109, 109, 97, 114, 121, 95, 115, 116, 111, 114, 101];
              };
            ];
          };
        };
        {
          "name": "student";
          "writable": true;
          "signer": true;
        };
        {
          "name": "systemProgram";
          "address": "11111111111111111111111111111111";
        };
      ];
      "args": [
        {
          "name": "transactionHash";
          "type": "string";
        };
        {
          "name": "summary";
          "type": "string";
        };
        {
          "name": "tags";
          "type": {
            "vec": "string";
          };
        };
        {
          "name": "category";
          "type": "string";
        };
        {
          "name": "confidenceScore";
          "type": "u8";
        };
      ];
    };
  ];
  "accounts": [
    {
      "name": "summaryStore";
      "discriminator": [17, 251, 92, 202, 242, 205, 34, 113];
    };
    {
      "name": "taggedSummary";
      "discriminator": [254, 19, 124, 133, 84, 230, 133, 226];
    };
  ];
  "errors": [
    {
      "code": 6000;
      "name": "tooManyTags";
      "msg": "Too many tags (maximum 10 allowed)";
    };
    {
      "code": 6001;
      "name": "summaryTooLong";
      "msg": "Summary too long (maximum 500 characters)";
    };
    {
      "code": 6002;
      "name": "invalidConfidence";
      "msg": "Invalid confidence score (0-100 only)";
    };
    {
      "code": 6003;
      "name": "invalidHash";
      "msg": "Transaction hash must be 64 characters";
    };
  ];
  "types": [
    {
      "name": "summaryStore";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "authority";
            "type": "pubkey";
          };
          {
            "name": "totalSummaries";
            "type": "u64";
          };
        ];
      };
    };
    {
      "name": "taggedSummary";
      "type": {
        "kind": "struct";
        "fields": [
          {
            "name": "id";
            "type": "u64";
          };
          {
            "name": "transactionHash";
            "type": "string";
          };
          {
            "name": "summary";
            "type": "string";
          };
          {
            "name": "tags";
            "type": {
              "vec": "string";
            };
          };
          {
            "name": "category";
            "type": "string";
          };
          {
            "name": "confidenceScore";
            "type": "u8";
          };
          {
            "name": "timestamp";
            "type": "i64";
          };
          {
            "name": "studentWallet";
            "type": "pubkey";
          };
        ];
      };
    };
  ];
}

export interface SummaryStore {
  authority: string;
  totalSummaries: number;
}

export interface TaggedSummary {
  id: number;
  transactionHash: string;
  summary: string;
  tags: string[];
  category: string;
  confidenceScore: number;
  timestamp: number;
  studentWallet: string;
}
