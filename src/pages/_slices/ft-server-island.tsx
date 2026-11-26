export default function FtServerIsland() {
  return <p data-testid="server-island">Server island rendered at {new Date().toISOString()}</p>;
}

export const getConfig = async () => ({ render: 'dynamic' }) as const;
