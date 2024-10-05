export function createInterval(handler: () => void, step: number = 1000): any {
  return setInterval(() => {
    handler()
  }, step)
}
