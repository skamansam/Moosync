export function arrayDiff(arr1: any[], arr2: any[]) {
  return arr1.filter(x => !arr2.includes(x));
}

export function convertDuration(n: number) {
  const tmp = new Date(n * 1000).toISOString().substr(11, 8)

  if (tmp[0] == '0' && tmp[1] == '0') {
    return tmp.substr(3)
  }

  return tmp
}