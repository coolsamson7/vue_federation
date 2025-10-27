export interface RemoteContainerConfig {
  url: string;
  scope: string;
  module: string;
}

const containers: Record<string, any> = {};

/**
 * Dynamically load a remote container via module federation
 */
export async function loadRemoteContainer(config: RemoteContainerConfig): Promise<any> {
  const { url, scope } = config;

  // Return cached container if already loaded
  if (containers[scope]) return containers[scope];

  try {
    // Load remoteEntry
    // @ts-ignore
    const container = await import(/* @vite-ignore */ url);

    // Initialize the container with shared modules
    await container.init?.(window.__federation_shared__ || {});

    containers[scope] = container;
    return container;
  } catch (err) {
    console.error(`Failed to load remote container ${scope} from ${url}:`, err);
    throw err;
  }
}