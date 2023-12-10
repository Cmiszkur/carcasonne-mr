/**
 * Compares two arrays, ignoring their order.
 * @param arr1
 * @param arr2
 * @returns
 */
export function compareArrays<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;

  // implement custom sort if necessary
  arr1.sort();
  arr2.sort();

  // use normal for loop so we can return immediately if not equal
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}
