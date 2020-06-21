declare module "recursive-copy" {
  export default function recursiveCopy(
    source: string,
    dest: string,
    options: {}
  ): Promise<any>;
}
