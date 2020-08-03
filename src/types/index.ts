export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type LeafsToType<T, N> = T extends string | number | boolean | Date
  ? N // If primitive transform to N
  : {
      [P in keyof T]?: LeafsToType<T[P], N>;
    };
