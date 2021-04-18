import chunk from "./chunk";

describe("tests for array chunking", () => {
    it("chunk called with an empty array should return an empty array", () => {
        const result = chunk([]);
        expect(result).toEqual([]);
    });

    it("chunk called with an array and the chunk size of 1 should return an array with chunks of length 1", () => {
        const result = chunk([1, 2, 3, 4, 5], 1);
        expect(result).toEqual([[1], [2], [3], [4], [5]]);
    });

    it("chunk called with an array and a chunk size of two should return an array with chunks of the maximum size two", () => {
        const result = chunk([1, 2, 3, 4, 5], 2);
        expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("chunk called with a chunk size greater than the array length should return an array with just one chunk with all elements", () => {
        const result = chunk([1, 2, 3, 4, 5], 6);
        expect(result.length).toBe(1);
        expect(result[0].length).toBe(5);
    });

    it("chunk called with a negative chunk size should return an array with just one chunk with all elements", () => {
        const result = chunk([1, 2, 3, 4, 5], -5);
        expect(result.length).toBe(1);
        expect(result[0].length).toBe(5);
    });

    it("chunk called with chunk size of zero should return an array with just one chunk with all elements", () => {
        const result = chunk([1, 2, 3, 4, 5], 0);
        expect(result.length).toBe(1);
        expect(result[0].length).toBe(5);
    });
});
