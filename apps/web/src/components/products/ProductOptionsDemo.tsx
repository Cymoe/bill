import React, { useState } from 'react';

// Demo data for Crown Molding Installation
const baseProduct = {
  name: 'Crown Molding Installation',
  basePrice: 12.5,
  unit: 'LF',
};
const attributes = [
  { option_name: 'Molding Grade', option_value: 'Standard', price_delta: 0 },
  { option_name: 'Molding Grade', option_value: 'Premium', price_delta: 2 },
  { option_name: 'Molding Grade', option_value: 'Stain-Grade', price_delta: 4 },
  { option_name: 'Finish', option_value: 'Painted', price_delta: 0 },
  { option_name: 'Finish', option_value: 'Stained', price_delta: 1.5 },
  { option_name: 'Finish', option_value: 'Natural', price_delta: 0 },
];

export const ProductOptionsDemo = () => {
  const optionNames = Array.from(new Set(attributes.map(a => a.option_name)));
  const [selected, setSelected] = useState(() => {
    const initial: Record<string, string> = {};
    optionNames.forEach(name => {
      const first = attributes.find(a => a.option_name === name);
      if (first) initial[name] = first.option_value;
    });
    return initial;
  });
  const [quantity, setQuantity] = useState(80); // default 80 LF

  const priceDelta = optionNames.reduce((sum, name) => {
    const attr = attributes.find(a => a.option_name === name && a.option_value === selected[name]);
    return sum + (attr ? Number(attr.price_delta) : 0);
  }, 0);
  const pricePerLF = baseProduct.basePrice + priceDelta;
  const total = pricePerLF * quantity;

  return (
    <div style={{ background: '#232635', color: '#fff', padding: 24, borderRadius: 12, maxWidth: 400 }}>
      <h2 style={{ fontWeight: 600, fontSize: 20 }}>{baseProduct.name}</h2>
      <div style={{ margin: '16px 0' }}>
        {optionNames.map(name => (
          <div key={name} style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 500 }}>{name}:</label>
            <select
              value={selected[name]}
              onChange={e => setSelected(s => ({ ...s, [name]: e.target.value }))}
              style={{ marginLeft: 8, padding: 4, borderRadius: 6 }}
            >
              {attributes.filter(a => a.option_name === name).map(a => (
                <option key={a.option_value} value={a.option_value}>
                  {a.option_value} {a.price_delta ? `(+$${a.price_delta})` : ''}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500 }}>Quantity ({baseProduct.unit}):</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value) || 1)}
            style={{ marginLeft: 8, padding: 4, borderRadius: 6, width: 80 }}
          />
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 18 }}>
        Price: ${pricePerLF.toFixed(2)} <span style={{ fontWeight: 400, fontSize: 14 }}>per {baseProduct.unit}</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 18, marginTop: 8 }}>
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
};

export default ProductOptionsDemo; 