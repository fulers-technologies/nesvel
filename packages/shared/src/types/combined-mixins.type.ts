// Utility type for combining multiple mixins
export type CombinedMixins<T, U = {}, V = {}, W = {}> = T & U & V & W;
