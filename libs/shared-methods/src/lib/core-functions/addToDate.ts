export function addToDate(inputDate: Date, type: 'hours' | 'minutes' | 'seconds', amount: number) {
  // Clone the inputDate to avoid modifying the original date
  const resultDate = new Date(inputDate);

  switch (type) {
    case 'hours':
      resultDate.setHours(resultDate.getHours() + amount);
      break;
    case 'minutes':
      resultDate.setMinutes(resultDate.getMinutes() + amount);
      break;
    case 'seconds':
      resultDate.setSeconds(resultDate.getSeconds() + amount);
      break;
  }

  // Add 24 hours (1 day) to the date
  resultDate.setHours(resultDate.getHours() + 24);

  return resultDate;
}
