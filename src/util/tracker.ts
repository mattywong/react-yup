const cache = new Map();

export const track = (name: string) => {
  const count = cache.get(name) || 0;

  console.log(`[${count}][${name}] rendered`);

  cache.set(name, count + 1);
};
