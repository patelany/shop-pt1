interface Price {
  $lte: number;
}

export default interface QueryDoc {
  name?: RegExp;
  price?: Price;
}
