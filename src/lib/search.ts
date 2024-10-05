import { StringBuilder } from "./string-builder"

const OPERATORS: { [key: string]: { prec: number; assoc: "l" | "r" } } = {
  AND: {
    prec: 6,
    assoc: "l",
  },
  OR: {
    prec: 5,
    assoc: "l",
  },
  "^": {
    prec: 4,
    assoc: "r",
  },
  "*": {
    prec: 3,
    assoc: "l",
  },
  "/": {
    prec: 3,
    assoc: "l",
  },
  "+": {
    prec: 2,
    assoc: "l",
  },
  "-": {
    prec: 2,
    assoc: "l",
  },
}

interface ISearchNode {
  v: string | null | undefined
  op: string
}

export function toRPN(input: string): ISearchNode[] {
  const opStack: string[] = []
  let buffer = new StringBuilder()
  let output: ISearchNode[] = []

  const peek = () => {
    return opStack.at(-1)
  }

  input = input
    .replaceAll(" ", " AND ")
    .replaceAll(" + ", " AND ")
    .replaceAll("AND OR", "OR")
    .replaceAll("OR AND", "OR")
    .replaceAll(/AND( AND)+/g, "AND")
    .replaceAll("(", " ( ")
    .replaceAll(")", " ) ")
    .replaceAll(/ +/g, " ")
    .trimStart()

  //console.log(input)

  const tokens = input.split(" ")

  for (let token of tokens) {
    switch (token) {
      case "AND":
      case "OR":
        const o1 = token
        let o2 = peek() // look at the top of the stack (last element of the array)

        while (
          o2 !== undefined &&
          o2 !== "(" &&
          (OPERATORS[o2].prec > OPERATORS[o1].prec ||
            (OPERATORS[o2].prec === OPERATORS[o1].prec &&
              OPERATORS[o1].assoc === "l"))
        ) {
          output.push({ v: null, op: opStack.pop() ?? "AND" })
          o2 = peek()
        }
        opStack.push(o1)
        break

      case "(":
        opStack.push(token)
        break
      case ")":
        let topOfOpStack = peek()
        while (topOfOpStack !== "(") {
          //assert(stack.length !== 0);
          output.push({ v: null, op: opStack.pop() ?? "AND" })
          topOfOpStack = peek()
        }
        //assert(peek() === '(');
        opStack.pop()
        break
      default:
        output.push({ v: token, op: "search" })
        break
    }
  }

  while (opStack.length !== 0) {
    output.push({ v: null, op: opStack.pop() ?? "AND" })
  }

  return output
}
