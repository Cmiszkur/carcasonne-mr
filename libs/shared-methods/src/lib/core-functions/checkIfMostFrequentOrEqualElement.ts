export function checkIfMostFrequentOrEqualElement(
  arr: (string | number)[],
  searchedElement: string | number | symbol
): boolean {
  if (arr.length === 0) {
    return false;
  }

  const frequencyMap: Record<string | number, number> = {};
  let maxCount = 1;

  for (const el of arr) {
    if (frequencyMap[el] == null) {
      frequencyMap[el] = 1;
    } else {
      frequencyMap[el]++;
    }

    if (frequencyMap[el] > maxCount) {
      maxCount = frequencyMap[el];
    }
  }
  const mostFrequentOwners: (string | number)[] = [];

  for (const el in frequencyMap) {
    if (frequencyMap[el] === maxCount) {
      mostFrequentOwners.push(el);
    }
  }

  return mostFrequentOwners.some((owner) => owner === searchedElement);
}
