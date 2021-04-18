const chunk = <T>(arr: T[], chunkSize = 1): T[][] => {
    return arr.reduce((acc: T[][], element: T) => {
        if (acc.length === 0 || acc[acc.length - 1].length === chunkSize) {
            acc.push([]);
        }

        acc[acc.length - 1].push(element);
        return acc;
    }, []) as T[][];
};

export default chunk;
