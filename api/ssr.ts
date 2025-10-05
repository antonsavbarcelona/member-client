export default async (req: any, res: any) => {
  const { app } = await import('../dist/member-client/server/server.mjs');
  return app(req, res);
};
