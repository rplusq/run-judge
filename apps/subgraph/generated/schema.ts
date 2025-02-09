// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal,
} from "@graphprotocol/graph-ts";

export class Challenge extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Challenge entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Challenge must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Challenge", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Challenge | null {
    return changetype<Challenge | null>(store.get_in_block("Challenge", id));
  }

  static load(id: string): Challenge | null {
    return changetype<Challenge | null>(store.get("Challenge", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get startTime(): BigInt {
    let value = this.get("startTime");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set startTime(value: BigInt) {
    this.set("startTime", Value.fromBigInt(value));
  }

  get distance(): BigInt {
    let value = this.get("distance");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set distance(value: BigInt) {
    this.set("distance", Value.fromBigInt(value));
  }

  get entryFee(): BigInt {
    let value = this.get("entryFee");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set entryFee(value: BigInt) {
    this.set("entryFee", Value.fromBigInt(value));
  }

  get isActive(): boolean {
    let value = this.get("isActive");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set isActive(value: boolean) {
    this.set("isActive", Value.fromBoolean(value));
  }

  get isCancelled(): boolean {
    let value = this.get("isCancelled");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set isCancelled(value: boolean) {
    this.set("isCancelled", Value.fromBoolean(value));
  }

  get winner(): Bytes | null {
    let value = this.get("winner");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set winner(value: Bytes | null) {
    if (!value) {
      this.unset("winner");
    } else {
      this.set("winner", Value.fromBytes(<Bytes>value));
    }
  }

  get winningActivityId(): BigInt | null {
    let value = this.get("winningActivityId");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set winningActivityId(value: BigInt | null) {
    if (!value) {
      this.unset("winningActivityId");
    } else {
      this.set("winningActivityId", Value.fromBigInt(<BigInt>value));
    }
  }

  get totalPrize(): BigInt {
    let value = this.get("totalPrize");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set totalPrize(value: BigInt) {
    this.set("totalPrize", Value.fromBigInt(value));
  }

  get participants(): ParticipantLoader {
    return new ParticipantLoader(
      "Challenge",
      this.get("id")!.toString(),
      "participants",
    );
  }

  get participantsLength(): BigInt {
    let value = this.get("participantsLength");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set participantsLength(value: BigInt) {
    this.set("participantsLength", Value.fromBigInt(value));
  }

  get createdAt(): BigInt {
    let value = this.get("createdAt");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set createdAt(value: BigInt) {
    this.set("createdAt", Value.fromBigInt(value));
  }

  get cancelledAt(): BigInt | null {
    let value = this.get("cancelledAt");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set cancelledAt(value: BigInt | null) {
    if (!value) {
      this.unset("cancelledAt");
    } else {
      this.set("cancelledAt", Value.fromBigInt(<BigInt>value));
    }
  }
}

export class Participant extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Participant entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Participant must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`,
      );
      store.set("Participant", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Participant | null {
    return changetype<Participant | null>(
      store.get_in_block("Participant", id),
    );
  }

  static load(id: string): Participant | null {
    return changetype<Participant | null>(store.get("Participant", id));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get challenge(): string {
    let value = this.get("challenge");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set challenge(value: string) {
    this.set("challenge", Value.fromString(value));
  }

  get participant(): Bytes {
    let value = this.get("participant");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set participant(value: Bytes) {
    this.set("participant", Value.fromBytes(value));
  }

  get hasJoined(): boolean {
    let value = this.get("hasJoined");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set hasJoined(value: boolean) {
    this.set("hasJoined", Value.fromBoolean(value));
  }

  get hasSubmitted(): boolean {
    let value = this.get("hasSubmitted");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set hasSubmitted(value: boolean) {
    this.set("hasSubmitted", Value.fromBoolean(value));
  }

  get stravaActivityId(): BigInt | null {
    let value = this.get("stravaActivityId");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set stravaActivityId(value: BigInt | null) {
    if (!value) {
      this.unset("stravaActivityId");
    } else {
      this.set("stravaActivityId", Value.fromBigInt(<BigInt>value));
    }
  }

  get isWinner(): boolean {
    let value = this.get("isWinner");
    if (!value || value.kind == ValueKind.NULL) {
      return false;
    } else {
      return value.toBoolean();
    }
  }

  set isWinner(value: boolean) {
    this.set("isWinner", Value.fromBoolean(value));
  }

  get joinedAt(): BigInt {
    let value = this.get("joinedAt");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set joinedAt(value: BigInt) {
    this.set("joinedAt", Value.fromBigInt(value));
  }

  get submittedAt(): BigInt | null {
    let value = this.get("submittedAt");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set submittedAt(value: BigInt | null) {
    if (!value) {
      this.unset("submittedAt");
    } else {
      this.set("submittedAt", Value.fromBigInt(<BigInt>value));
    }
  }
}

export class ParticipantLoader extends Entity {
  _entity: string;
  _field: string;
  _id: string;

  constructor(entity: string, id: string, field: string) {
    super();
    this._entity = entity;
    this._id = id;
    this._field = field;
  }

  load(): Participant[] {
    let value = store.loadRelated(this._entity, this._id, this._field);
    return changetype<Participant[]>(value);
  }
}
