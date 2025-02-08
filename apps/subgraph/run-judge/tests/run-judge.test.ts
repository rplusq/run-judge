import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { ChallengeCreated } from "../generated/schema"
import { ChallengeCreated as ChallengeCreatedEvent } from "../generated/RunJudge/RunJudge"
import { handleChallengeCreated } from "../src/run-judge"
import { createChallengeCreatedEvent } from "./run-judge-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let challengeId = BigInt.fromI32(234)
    let startTime = BigInt.fromI32(234)
    let distance = BigInt.fromI32(234)
    let entryFee = BigInt.fromI32(234)
    let newChallengeCreatedEvent = createChallengeCreatedEvent(
      challengeId,
      startTime,
      distance,
      entryFee
    )
    handleChallengeCreated(newChallengeCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ChallengeCreated created and stored", () => {
    assert.entityCount("ChallengeCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ChallengeCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "challengeId",
      "234"
    )
    assert.fieldEquals(
      "ChallengeCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "startTime",
      "234"
    )
    assert.fieldEquals(
      "ChallengeCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "distance",
      "234"
    )
    assert.fieldEquals(
      "ChallengeCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "entryFee",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
