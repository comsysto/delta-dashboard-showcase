export const getDatePartOfIsoDateTime = (isoString: string): string => isoString.slice(0, isoString.indexOf("T"));

export const getTimePartOfIsoDateTime = (isoString: string): string => isoString.slice(isoString.indexOf("T") + 1);
