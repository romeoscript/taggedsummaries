import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TaggedSummaries } from "../target/types/tagged_summaries";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("tagged-summaries", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.taggedSummaries as Program<TaggedSummaries>;
  const provider = anchor.getProvider();

  let authority: Keypair;
  let student: Keypair;
  let summaryStorePDA: PublicKey;

  before(async () => {
    authority = Keypair.generate();
    student = Keypair.generate();

    await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(student.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await new Promise(resolve => setTimeout(resolve, 1000));

    [summaryStorePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("summary_store")],
      program.programId
    );
  });

  describe("Initialize", () => {
    it("Should initialize the summary store", async () => {
      const tx = await program.methods
        .initialize()
        .accounts({
          summaryStore: summaryStorePDA,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      console.log("Initialize transaction signature:", tx);

      const summaryStore = await program.account.summaryStore.fetch(summaryStorePDA);
      expect(summaryStore.authority.toString()).to.equal(authority.publicKey.toString());
      expect(summaryStore.totalSummaries.toNumber()).to.equal(0);
    });

    it("Should fail to initialize twice", async () => {
      try {
        await program.methods
          .initialize()
          .accounts({
            summaryStore: summaryStorePDA,
            authority: authority.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
        
        expect.fail("Should have failed to initialize twice");
      } catch (error) {
        expect(error.message).to.include("already in use");
      }
    });
  });

  describe("Store Tagged Summary", () => {
    it("Should store a valid tagged summary", async () => {
      const transactionHash = "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890";
      const summary = "Student purchased lunch at campus cafeteria for $12.50";
      const tags = ["food", "cafeteria", "lunch", "meal"];
      const category = "food";
      const confidenceScore = 95;

      const tx = await program.methods
        .storeTaggedSummary(
          transactionHash,
          summary,
          tags,
          category,
          confidenceScore
        )
        .accounts({
          taggedSummary: {}, // Let Anchor derive the PDA
          summaryStore: summaryStorePDA,
          student: student.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([student])
        .rpc();

      console.log("Store summary transaction signature:", tx);

      // Verify the summary store counter was incremented
      const summaryStore = await program.account.summaryStore.fetch(summaryStorePDA);
      expect(summaryStore.totalSummaries.toNumber()).to.equal(1);
    });

    it("Should store multiple summaries", async () => {
      const student2 = Keypair.generate();
      await provider.connection.requestAirdrop(student2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const transactionHash = "b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1";
      const summary = "Student purchased textbook at campus bookstore for $45.00";
      const tags = ["academic", "bookstore", "textbook", "education"];
      const category = "academic";
      const confidenceScore = 88;

      const tx = await program.methods
        .storeTaggedSummary(
          transactionHash,
          summary,
          tags,
          category,
          confidenceScore
        )
        .accounts({
          summaryStore: summaryStorePDA,
          student: student2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([student2])
        .rpc();

      console.log("Store second summary transaction signature:", tx);

      // Verify the summary store counter was incremented
      const summaryStore = await program.account.summaryStore.fetch(summaryStorePDA);
      expect(summaryStore.totalSummaries.toNumber()).to.equal(2);
    });
  });

  describe("Error Handling", () => {
    it("Should fail with too many tags", async () => {
      const transactionHash = "c3d4e5f6789012345678901234567890123456789012345678901234567890a1b2";
      const summary = "Test transaction";
      const tags = ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11"];
      const category = "test";
      const confidenceScore = 50;

      try {
        await program.methods
          .storeTaggedSummary(
            transactionHash,
            summary,
            tags,
            category,
            confidenceScore
          )
          .accounts({
            summaryStore: summaryStorePDA,
            student: student.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([student])
          .rpc();
        
        expect.fail("Should have failed with too many tags");
      } catch (error) {
        console.log("Error message:", error.message);
        expect(error.message).to.include("Too many tags");
      }
    });

    it("Should fail with summary too long", async () => {
      const transactionHash = "d4e5f6789012345678901234567890123456789012345678901234567890a1b2c3";
      const summary = "a".repeat(501);
      const tags = ["test"];
      const category = "test";
      const confidenceScore = 50;

      try {
        await program.methods
          .storeTaggedSummary(
            transactionHash,
            summary,
            tags,
            category,
            confidenceScore
          )
          .accounts({
            summaryStore: summaryStorePDA,
            student: student.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([student])
          .rpc();
        
        expect.fail("Should have failed with summary too long");
      } catch (error) {
        console.log("Error message:", error.message);
        expect(error.message).to.include("Summary too long");
      }
    });

    it("Should fail with invalid confidence score", async () => {
      const transactionHash = "e5f6789012345678901234567890123456789012345678901234567890a1b2c3d4";
      const summary = "Test transaction";
      const tags = ["test"];
      const category = "test";
      const confidenceScore = 101;

      try {
        await program.methods
          .storeTaggedSummary(
            transactionHash,
            summary,
            tags,
            category,
            confidenceScore
          )
          .accounts({
            summaryStore: summaryStorePDA,
            student: student.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([student])
          .rpc();
        
        expect.fail("Should have failed with invalid confidence score");
      } catch (error) {
        console.log("Error message:", error.message);
        expect(error.message).to.include("Invalid confidence score");
      }
    });

    it("Should fail with invalid transaction hash length", async () => {
      const transactionHash = "invalid_hash";
      const summary = "Test transaction";
      const tags = ["test"];
      const category = "test";
      const confidenceScore = 50;

      try {
        await program.methods
          .storeTaggedSummary(
            transactionHash,
            summary,
            tags,
            category,
            confidenceScore
          )
          .accounts({
            summaryStore: summaryStorePDA,
            student: student.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([student])
          .rpc();
        
        expect.fail("Should have failed with invalid hash length");
      } catch (error) {
        console.log("Error message:", error.message);
        expect(error.message).to.include("Transaction hash must be 64 characters");
      }
    });
  });
});