import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TaggedSummaries } from "../target/types/tagged_summaries";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("tagged-summaries-simple", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.taggedSummaries as Program<TaggedSummaries>;
  const provider = anchor.getProvider();

  let authority: Keypair;
  let summaryStorePDA: PublicKey;

  before(async () => {
    authority = Keypair.generate();
    await provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await new Promise(resolve => setTimeout(resolve, 1000));

    [summaryStorePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("summary_store")],
      program.programId
    );
  });

  it("Should initialize the summary store successfully", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        summaryStore: summaryStorePDA,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    console.log("✅ Initialize transaction signature:", tx);

    const summaryStore = await program.account.summaryStore.fetch(summaryStorePDA);
    expect(summaryStore.authority.toString()).to.equal(authority.publicKey.toString());
    expect(summaryStore.totalSummaries.toNumber()).to.equal(0);
    
    console.log("✅ Summary store initialized successfully");
    console.log("   Authority:", summaryStore.authority.toString());
    console.log("   Total summaries:", summaryStore.totalSummaries.toNumber());
  });

  it("Should verify program deployment and basic functionality", async () => {
    // Test that we can fetch the program account
    const programAccount = await provider.connection.getAccountInfo(program.programId);
    expect(programAccount).to.not.be.null;
    expect(programAccount!.executable).to.be.true;
    
    console.log("✅ Program deployed successfully");
    console.log("   Program ID:", program.programId.toString());
    console.log("   Program executable:", programAccount!.executable);
  });
});
