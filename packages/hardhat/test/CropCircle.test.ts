import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { CropCircle } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("CropCircle", function () {
  let cropCircle: CropCircle;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let user3: HardhatEthersSigner;
  let eventId: string;
  const EVENT_DURATION = 3600; // 1 hour
  const EVENT_URI = "https://app.example.com/event/";
  const INITIAL_CROP_AMOUNT = 100n;
  const SUBMISSION_COST = 60n;
  const VOTE_COST = 1n;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const CropCircleFactory = await ethers.getContractFactory("CropCircle");
    cropCircle = await CropCircleFactory.deploy() as CropCircle;
    await cropCircle.waitForDeployment();

    // Create an event and get the event ID from the emitted event
    const tx = await cropCircle.createEvent(EVENT_DURATION, EVENT_URI);
    const receipt = await tx.wait();
    const event = receipt?.logs[0];
    if (!event) throw new Error("Event not emitted");
    
    // The first topic is the event signature, the second is the event ID
    eventId = event.topics[1];
  });

  describe("Event Creation", function () {
    it("Should create an event with correct parameters", async function () {
      const event = await cropCircle.getEventDetails(eventId);
      expect(event.active).to.be.true;
      expect(event.eventUri).to.equal(EVENT_URI);
      expect(event.endTime).to.be.gt(event.startTime);
      expect(event.endTime - event.startTime).to.equal(EVENT_DURATION);
    });

    it("Should fail if non-owner tries to create event", async function () {
      await expect(cropCircle.connect(user1).createEvent(EVENT_DURATION, EVENT_URI))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail with invalid duration", async function () {
      await expect(cropCircle.createEvent(0, EVENT_URI))
        .to.be.revertedWith("Invalid duration");
    });

    it("Should fail with empty event URI", async function () {
      await expect(cropCircle.createEvent(EVENT_DURATION, ""))
        .to.be.revertedWith("Invalid event URI");
    });
  });

  describe("Meme Submission", function () {
    it("Should allow meme submission and initialize CROP balance", async function () {
      await expect(cropCircle.connect(user1).submitMeme(eventId, "Test Meme", "hash", "description"))
        .to.emit(cropCircle, "MemeSubmitted")
        .withArgs(eventId, 1, user1.address, "Test Meme", "hash");

      const balance = await cropCircle.userCropBalance(user1.address, eventId);
      expect(balance).to.equal(INITIAL_CROP_AMOUNT - SUBMISSION_COST);
    });

    it("Should fail with insufficient CROP after multiple submissions", async function () {
      // First submission (costs 60 CROP)
      await cropCircle.connect(user1).submitMeme(eventId, "Meme 1", "hash1", "desc1");
      
      // Second submission should fail (only 40 CROP left)
      await expect(cropCircle.connect(user1).submitMeme(eventId, "Meme 2", "hash2", "desc2"))
        .to.be.revertedWith("Insufficient CROP");
    });

    it("Should fail with invalid input", async function () {
      await expect(cropCircle.connect(user1).submitMeme(eventId, "", "hash", "description"))
        .to.be.revertedWith("Invalid input");
    });
  });

  describe("Voting System", function () {
    beforeEach(async function () {
      await cropCircle.connect(user1).submitMeme(eventId, "Test Meme", "hash", "description");
    });

    it("Should allow voting and initialize CROP balance", async function () {
      await expect(cropCircle.connect(user2).vote(eventId, 1, true))
        .to.emit(cropCircle, "VoteCast")
        .withArgs(eventId, 1, user2.address, true);

      const balance = await cropCircle.userCropBalance(user2.address, eventId);
      expect(balance).to.equal(INITIAL_CROP_AMOUNT - VOTE_COST);
    });

    it("Should prevent self-voting", async function () {
      await expect(cropCircle.connect(user1).vote(eventId, 1, true))
        .to.be.revertedWith("Cannot vote own meme");
    });

    it("Should prevent double voting", async function () {
      await cropCircle.connect(user2).vote(eventId, 1, true);
      await expect(cropCircle.connect(user2).vote(eventId, 1, true))
        .to.be.revertedWith("Already voted");
    });

    it("Should track vote counts correctly", async function () {
      await cropCircle.connect(user2).vote(eventId, 1, true);
      const meme = await cropCircle.getMemeDetails(eventId, 1);
      expect(meme.upvotes).to.equal(1);
      expect(meme.downvotes).to.equal(0);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await cropCircle.connect(user1).submitMeme(eventId, "Meme 1", "hash1", "desc1");
      await cropCircle.connect(user2).submitMeme(eventId, "Meme 2", "hash2", "desc2");
      await cropCircle.connect(user2).vote(eventId, 1, true);
    });

    it("Should return sorted memes by upvotes", async function () {
      const sortedMemes = await cropCircle.getMemesSorted(eventId, true);
      expect(sortedMemes[0]).to.equal(1); // Most upvoted first
      expect(sortedMemes[1]).to.equal(2);
    });

    it("Should return sorted memes by timestamp", async function () {
      const sortedMemes = await cropCircle.getMemesSorted(eventId, false);
      expect(sortedMemes[0]).to.equal(2); // Newest first
      expect(sortedMemes[1]).to.equal(1);
    });

    it("Should return correct meme details", async function () {
      const meme = await cropCircle.getMemeDetails(eventId, 1);
      expect(meme.name).to.equal("Meme 1");
      expect(meme.imageHash).to.equal("hash1");
      expect(meme.description).to.equal("desc1");
      expect(meme.creator).to.equal(user1.address);
      expect(meme.upvotes).to.equal(1);
      expect(meme.exists).to.be.true;
    });
  });

  describe("Event Ending and Token Distribution", function () {
    beforeEach(async function () {
      await cropCircle.connect(user1).submitMeme(eventId, "Winning Meme", "hash1", "desc1");
      await cropCircle.connect(user2).vote(eventId, 1, true);
    });

    it("Should end event and create token", async function () {
      // Increase time to event end
      await time.increase(EVENT_DURATION + 1);

      await expect(cropCircle.endEvent(eventId))
        .to.emit(cropCircle, "EventEnded");

      const event = await cropCircle.getEventDetails(eventId);
      expect(event.active).to.be.false;
      expect(event.winningMemeId).to.equal(1);
      expect(event.tokenAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should fail to end event before duration", async function () {
      await expect(cropCircle.endEvent(eventId))
        .to.be.revertedWith("Event still ongoing");
    });

    it("Should fail to end event with no valid winner", async function () {
      const tx = await cropCircle.createEvent(EVENT_DURATION, EVENT_URI);
      const receipt = await tx.wait();
      const newEventId = receipt?.logs[0].topics[1];

      await time.increase(EVENT_DURATION + 1);

      await expect(cropCircle.endEvent(newEventId))
        .to.be.revertedWith("No valid winner");
    });
  });
});