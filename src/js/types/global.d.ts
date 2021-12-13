declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

export type ArrayItem<T extends any[]> = T extends (infer Titem)[] ? Titem : never;
export type ResolvedType<T> = T extends Promise<infer R> ? R : T;
export type GeneratorType<T extends (...args: any) => any> = ResolvedType<ReturnType<T>>;

export type Config = {
  /** APIの設定 */
  api: {
    /** ajax.php?url= */
    ajax: string;
  };
};

export type PartsData = {
  hairColor: Part[];
  hairStyle: Part[];
  bangs: Part[];
};

export type Part = {
  name: string;
  img: string;
};
