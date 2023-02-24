"use strict";

const { ServiceBroker } = require("moleculer");
const ChannelService = require("../../services/channel.service");
var { Types } = require("mongoose");

describe("Test channel actions", () => {
  describe("Test actions", () => {
    const broker = new ServiceBroker({ logger: false });
    const service = broker.createService(ChannelService);

    beforeAll(() => broker.start());
    afterAll(() => broker.stop());

    let name = "Channel#9";
    let createdBy = Types.ObjectId();
    // create a mock insert function
    const mockInsert = jest.fn((params) =>
      Promise.resolve({ name: name, createdBy: createdBy })
    );

    describe("Test channel create", () => {
      it("should create new channel", async () => {
        ChannelService.actions.create = mockInsert;

        const res = await broker.call("channels.create", {
          name: name,
          createdBy: createdBy,
        });
        console.log(res, "res");
        expect(res.message).toBe("Channel is created successfully.");
      });
    });
  });
});
