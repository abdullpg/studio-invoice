export interface ItemLike {
  qty: number;
  price: number;
}

export function lineTotal(item: ItemLike): number {
  return (Number(item.qty) || 0) * (Number(item.price) || 0);
}

export interface Totals {
  subtotal: number;
  discount: number;
  total: number;
}

export function computeTotals(
  items: ItemLike[],
  discountType: string,
  discountValue: number,
): Totals {
  const subtotal = items.reduce((sum, it) => sum + lineTotal(it), 0);
  let discount =
    discountType === "percent"
      ? (subtotal * (Number(discountValue) || 0)) / 100
      : Number(discountValue) || 0;
  discount = Math.max(0, Math.min(discount, subtotal));
  return { subtotal, discount, total: subtotal - discount };
}
