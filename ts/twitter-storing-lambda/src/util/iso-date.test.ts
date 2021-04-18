import {getDatePartOfIsoDateTime, getTimePartOfIsoDateTime} from "./iso-date";

describe("iso-date tests", () => {
    it("getDatePartOfIsoDateTime should return date part", () => {
       const isoDateString = "2021-02-05T16:44:36.389Z";
       expect(getDatePartOfIsoDateTime(isoDateString)).toBe("2021-02-05");
    });

    it("getTimePartOfIsoDateTime should return time part", () => {
        const isoDateString = "2021-02-05T16:44:36.389Z";
        expect(getTimePartOfIsoDateTime(isoDateString)).toBe("16:44:36.389Z");
    });
});
