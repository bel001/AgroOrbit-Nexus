declare module "virtual:hosting-assets" {
  const assets: Record<string, { type: string; body: string }>;
  export default assets;
}
